// FILE: backend/src/config/firebase.ts
import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

// Initialize Firebase Admin SDK
let firebaseAdmin: admin.app.App;

try {
  // Method 1: Load from service account JSON file path
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  
  if (serviceAccountPath) {
    console.log('📁 Loading Firebase service account from:', serviceAccountPath);
    
    // Resolve absolute path
    const absolutePath = path.resolve(serviceAccountPath);
    
    // Import service account JSON
    const serviceAccount = require(absolutePath);
    
    // Initialize Firebase Admin SDK
    firebaseAdmin = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });
    
    console.log('✅ Firebase Admin SDK initialized successfully');
    console.log('   Project ID:', serviceAccount.project_id);
  } else {
    // Method 2: Load from GOOGLE_APPLICATION_CREDENTIALS env var
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.log('📁 Loading Firebase from GOOGLE_APPLICATION_CREDENTIALS');
      firebaseAdmin = admin.initializeApp();
      console.log('✅ Firebase Admin SDK initialized from environment');
    } else {
      throw new Error(
        'Firebase service account configuration not found. ' +
        'Please set FIREBASE_SERVICE_ACCOUNT_PATH or GOOGLE_APPLICATION_CREDENTIALS environment variable.'
      );
    }
  }
} catch (error: any) {
  console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
  console.error('Make sure:');
  console.error('1. Service account JSON file exists at the path specified');
  console.error('2. FIREBASE_SERVICE_ACCOUNT_PATH is correctly set in .env');
  console.error('3. The JSON file has proper permissions');
  process.exit(1);
}

// Export Firebase Admin SDK instance
export { firebaseAdmin };

// Utility function to verify tokens
export const verifyToken = async (token: string) => {
  try {
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error: any) {
    throw new Error(`Token verification failed: ${error.message}`);
  }
};