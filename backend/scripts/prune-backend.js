#!/usr/bin/env node
/*
  Prune Backend: Build import graph from backend/src/index.ts and list/move orphaned files.
  - Dry run by default: prints reachable and orphan lists
  - Use --archive to move orphans to backend/_archive preserving structure
*/

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const srcRoot = path.join(projectRoot, 'src');
const archiveRoot = path.join(projectRoot, '_archive');

const args = new Set(process.argv.slice(2));
const doArchive = args.has('--archive');

// Allowlist: paths (relative to src) or glob-like prefixes to always keep
const allowlistPrefixes = [
  'config/',
  'middleware/',
  'models/',
  'types/',
  'routes/index.ts',
  'utils/', // conservative: keep utils in case of dynamic usage; tighten later if needed
];

const testRegex = /\.test\.|__tests__/;

/** Read all TS/TSX files under src */
function listAllSourceFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist') continue;
      results.push(...listAllSourceFiles(full));
    } else if (entry.isFile()) {
      if ((entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) && !testRegex.test(full)) {
        results.push(full);
      }
    }
  }
  return results;
}

/**
 * Parse import lines; handles basic `import ... from 'x'` and `require('x')`.
 * Returns array of raw specifiers.
 */
function parseImports(filePath, fileContent) {
  const imports = [];
  const importRegex = /import[^'"`]*['"`]([^'"`]+)['"`]/g;
  const requireRegex = /require\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
  const exportFromRegex = /export\s+[^'"`]*from\s*['"`]([^'"`]+)['"`]/g;

  let m;
  while ((m = importRegex.exec(fileContent))) imports.push(m[1]);
  while ((m = requireRegex.exec(fileContent))) imports.push(m[1]);
  while ((m = exportFromRegex.exec(fileContent))) imports.push(m[1]);

  // Convert to absolute resolved file paths where possible
  const resolved = [];
  for (const spec of imports) {
    if (spec.startsWith('.')) {
      const abs = resolveModule(filePath, spec);
      if (abs) resolved.push(abs);
    } else if (spec.startsWith('/')) {
      const abs = resolveAbsolute(spec);
      if (abs) resolved.push(abs);
    } else {
      // external module; ignore
    }
  }
  return resolved;
}

function resolveAbsolute(spec) {
  const candidates = createCandidates(spec);
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

function resolveModule(fromFile, spec) {
  const base = path.resolve(path.dirname(fromFile), spec);
  const candidates = createCandidates(base);
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

function createCandidates(basePathNoExt) {
  const candidates = [];
  // direct files
  candidates.push(basePathNoExt);
  candidates.push(basePathNoExt + '.ts');
  candidates.push(basePathNoExt + '.tsx');
  // index files under directory
  candidates.push(path.join(basePathNoExt, 'index.ts'));
  candidates.push(path.join(basePathNoExt, 'index.tsx'));
  return candidates;
}

/** Build dependency graph: file -> Set(dependency files) */
function buildGraph(allFiles) {
  const graph = new Map();
  for (const file of allFiles) {
    const code = fs.readFileSync(file, 'utf8');
    const deps = new Set(parseImports(file, code));
    graph.set(file, deps);
  }
  return graph;
}

function isUnderSrc(absPath) {
  return absPath.startsWith(srcRoot + path.sep);
}

function toSrcRel(absPath) {
  return path.relative(srcRoot, absPath).replace(/\\/g, '/');
}

function isAllowlisted(absPath) {
  const rel = toSrcRel(absPath);
  return allowlistPrefixes.some((p) => rel === p || rel.startsWith(p));
}

function traverseReachable(graph, entry) {
  const visited = new Set();
  const stack = [entry];
  while (stack.length) {
    const f = stack.pop();
    if (!f || visited.has(f)) continue;
    visited.add(f);
    const deps = graph.get(f);
    if (!deps) continue;
    for (const d of deps) {
      if (isUnderSrc(d)) stack.push(d);
    }
  }
  return visited;
}

function ensureDirSync(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function archiveFile(absPath) {
  const relFromSrc = path.relative(srcRoot, absPath);
  const dest = path.join(archiveRoot, relFromSrc);
  ensureDirSync(path.dirname(dest));
  ensureDirSync(path.dirname(absPath));
  fs.renameSync(absPath, dest);
}

function main() {
  if (!fs.existsSync(srcRoot)) {
    console.error('Cannot find src root at', srcRoot);
    process.exit(1);
  }

  const entry = path.join(srcRoot, 'index.ts');
  if (!fs.existsSync(entry)) {
    console.error('Entry file not found:', entry);
    process.exit(1);
  }

  const allFiles = listAllSourceFiles(srcRoot);
  const graph = buildGraph(allFiles);
  const reachable = traverseReachable(graph, entry);

  const allUnderSrc = new Set(allFiles.filter(isUnderSrc));
  const orphans = [];
  for (const f of allUnderSrc) {
    if (testRegex.test(f)) continue; // ignore tests entirely
    if (reachable.has(f)) continue;
    if (isAllowlisted(f)) continue;
    orphans.push(f);
  }

  // Output summary
  console.log('Reachable files:', reachable.size);
  console.log('Total source files:', allUnderSrc.size);
  console.log('Orphan candidates (after allowlist):', orphans.length);
  console.log('--- Orphans ---');
  for (const f of orphans) console.log(path.relative(projectRoot, f));

  if (doArchive) {
    console.log(`\nArchiving ${orphans.length} files to`, path.relative(projectRoot, archiveRoot));
    ensureDirSync(archiveRoot);
    for (const f of orphans) archiveFile(f);
    console.log('Archival complete.');
  } else {
    console.log('\nDry run complete. Use --archive to move these files under _archive/.');
  }
}

main();


