import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { pipeline } from 'stream';
import { createWriteStream } from 'fs';

dotenv.config();

const streamPipeline = promisify(pipeline);

// D-ID API configuration
const DID_API_KEY = process.env.DID_API_KEY || process.env.AVATAR_API_KEY;
const AVATAR_IMAGE_URL = process.env.AVATAR_IMAGE_URL || 'https://create-images-results.d-id.com/api_docs/assets/noelle.jpeg';

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://tiapdsojkbqjucmjmjri.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY not found. Video uploads will fail.');
}

if (!DID_API_KEY) {
  console.warn('⚠️ DID_API_KEY or AVATAR_API_KEY not found. Video generation will fail.');
}

const supabase = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

const BUCKET_NAME = 'capstone';
const TEMP_DIR = path.join(process.cwd(), 'temp-videos');

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

interface Question {
  order: number;
  text: string;
  videoUrl: string;
}

/**
 * Generate a video using D-ID API
 */
async function generateDIDVideo(text: string, sourceImageUrl: string = AVATAR_IMAGE_URL): Promise<string> {
  if (!DID_API_KEY) {
    throw new Error('DID_API_KEY not configured');
  }

  const auth = 'Basic ' + Buffer.from(`${DID_API_KEY}:`).toString('base64');

  // Create talk
  const createResponse = await fetch('https://api.d-id.com/talks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: auth,
    },
    body: JSON.stringify({
      script: {
        type: 'text',
        input: text,
        provider: { type: 'microsoft', voice_id: 'en-US-JennyNeural' },
      },
      source_url: sourceImageUrl,
      config: { stitch: true },
    }),
  });

  if (!createResponse.ok) {
    const errorText = await createResponse.text();
    throw new Error(`Create talk failed: ${errorText}`);
  }

  const { id } = await createResponse.json();
  if (!id) {
    throw new Error('No talk id returned');
  }

  // Poll for video completion
  const maxTries = 120; // 4 minutes max
  for (let tries = 0; tries < maxTries; tries++) {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const statusResponse = await fetch(`https://api.d-id.com/talks/${id}`, {
      headers: { Authorization: auth },
    });

    if (!statusResponse.ok) {
      const errorText = await statusResponse.text();
      throw new Error(`Status check failed: ${errorText}`);
    }

    const statusData = await statusResponse.json();

    if (statusData.status === 'done' && statusData.result_url) {
      return statusData.result_url;
    }

    if (statusData.status === 'error') {
      throw new Error(statusData.error?.description || statusData.error || 'D-ID job error');
    }
  }

  throw new Error('Timed out waiting for video (4 minutes)');
}

/**
 * Download video from URL to temporary file
 */
async function downloadVideo(url: string, filePath: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download video: ${response.statusText}`);
  }

  if (!response.body) {
    throw new Error('Response body is null');
  }

  const fileStream = createWriteStream(filePath);
  // @ts-ignore - response.body is a ReadableStream in Node.js 18+
  await streamPipeline(response.body, fileStream);
}

/**
 * Upload video to Supabase storage
 */
async function uploadToSupabase(
  filePath: string,
  storagePath: string
): Promise<string> {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const fileBuffer = fs.readFileSync(filePath);

  // Upload file
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storagePath, fileBuffer, {
      contentType: 'video/mp4',
      upsert: true, // Overwrite if exists
    });

  if (error) {
    throw new Error(`Failed to upload to Supabase: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(storagePath);

  if (!urlData?.publicUrl) {
    throw new Error('Failed to get public URL from Supabase');
  }

  return urlData.publicUrl;
}

/**
 * Generate and store videos for questions
 * @param questions - Array of questions with placeholder videoUrls
 * @param userId - MongoDB ObjectId string
 * @param scenarioId - MongoDB ObjectId string
 * @param level - Level number (2 or 3)
 * @param sourceImageUrl - Optional custom avatar image URL
 * @returns Updated questions array with Supabase video URLs
 */
export async function generateAndStoreVideos(
  questions: Question[],
  userId: string,
  scenarioId: string,
  level: 2 | 3,
  sourceImageUrl?: string
): Promise<Question[]> {
  if (!DID_API_KEY) {
    console.error('❌ DID_API_KEY not configured. Skipping video generation.');
    return questions; // Return original questions with placeholder URLs
  }

  if (!supabase) {
    console.error('❌ Supabase not configured. Skipping video upload.');
    return questions;
  }

  const updatedQuestions: Question[] = [];

  for (const question of questions) {
    try {
      console.log(`🎬 Generating video for question ${question.order}: "${question.text.substring(0, 50)}..."`);

      // Generate video using D-ID
      const didVideoUrl = await generateDIDVideo(question.text, sourceImageUrl);

      // Create filename: {userId}_{scenarioId}_{level}_{order}.mp4
      const fileName = `${userId}_${scenarioId}_level${level}_${question.order}.mp4`;
      const storagePath = `avatar-videos/${userId}/${scenarioId}/${level}/${fileName}`;
      const tempFilePath = path.join(TEMP_DIR, fileName);

      try {
        // Download video from D-ID
        console.log(`📥 Downloading video from D-ID...`);
        await downloadVideo(didVideoUrl, tempFilePath);

        // Upload to Supabase
        console.log(`☁️ Uploading to Supabase: ${storagePath}`);
        const publicUrl = await uploadToSupabase(tempFilePath, storagePath);

        // Update question with Supabase URL
        updatedQuestions.push({
          ...question,
          videoUrl: publicUrl,
        });

        console.log(`✅ Video stored successfully: ${publicUrl}`);

        // Clean up temp file
        try {
          fs.unlinkSync(tempFilePath);
        } catch (cleanupError) {
          console.warn(`⚠️ Failed to delete temp file: ${cleanupError}`);
        }
      } catch (error: any) {
        console.error(`❌ Failed to process video for question ${question.order}:`, error.message);
        // Keep original placeholder URL
        updatedQuestions.push(question);
      }
    } catch (error: any) {
      console.error(`❌ Failed to generate video for question ${question.order}:`, error.message);
      // Keep original placeholder URL
      updatedQuestions.push(question);
    }
  }

  return updatedQuestions;
}

