import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

let firebaseAdmin: admin.app.App;

try {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  
  if (serviceAccountPath) {
    console.log('📁 Loading Firebase service account from:', serviceAccountPath);
    
    const absolutePath = path.resolve(serviceAccountPath);
    
    const serviceAccount = require(absolutePath);
    
    firebaseAdmin = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });
    
    console.log('✅ Firebase Admin SDK initialized successfully');
    console.log('   Project ID:', serviceAccount.project_id);
  } else {
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

export { firebaseAdmin };

export const verifyToken = async (token: string) => {
  try {
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error: any) {
    throw new Error(`Token verification failed: ${error.message}`);
  }
};
