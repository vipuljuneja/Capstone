"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.firebaseAdmin = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
let firebaseAdmin;
try {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    if (serviceAccountPath) {
        console.log('📁 Loading Firebase service account from:', serviceAccountPath);
        const absolutePath = path_1.default.resolve(serviceAccountPath);
        const serviceAccount = require(absolutePath);
        exports.firebaseAdmin = firebaseAdmin = firebase_admin_1.default.initializeApp({
            credential: firebase_admin_1.default.credential.cert(serviceAccount),
            projectId: serviceAccount.project_id,
        });
        console.log('✅ Firebase Admin SDK initialized successfully');
        console.log('   Project ID:', serviceAccount.project_id);
    }
    else {
        if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            console.log('📁 Loading Firebase from GOOGLE_APPLICATION_CREDENTIALS');
            exports.firebaseAdmin = firebaseAdmin = firebase_admin_1.default.initializeApp();
            console.log('✅ Firebase Admin SDK initialized from environment');
        }
        else {
            throw new Error('Firebase service account configuration not found. ' +
                'Please set FIREBASE_SERVICE_ACCOUNT_PATH or GOOGLE_APPLICATION_CREDENTIALS environment variable.');
        }
    }
}
catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
    console.error('Make sure:');
    console.error('1. Service account JSON file exists at the path specified');
    console.error('2. FIREBASE_SERVICE_ACCOUNT_PATH is correctly set in .env');
    console.error('3. The JSON file has proper permissions');
    process.exit(1);
}
const verifyToken = async (token) => {
    try {
        const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
        return decodedToken;
    }
    catch (error) {
        throw new Error(`Token verification failed: ${error.message}`);
    }
};
exports.verifyToken = verifyToken;
//# sourceMappingURL=firebase.js.map