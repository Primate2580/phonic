const env = import.meta.env;

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

export const cloudinary = {
  cloudName: env.VITE_CLOUDINARY_CLOUD_NAME,
  uploadPreset: env.VITE_CLOUDINARY_UPLOAD_PRESET,
};

export const WORKER_URL = (env.VITE_R2_WORKER_URL || "").replace(/\/$/, ""); 
// could it be this line above?
export const ADMIN_EMAIL = (env.VITE_ADMIN_EMAIL || "").trim().toLowerCase();

const required = {
  VITE_FIREBASE_API_KEY: firebaseConfig.apiKey,
  VITE_FIREBASE_AUTH_DOMAIN: firebaseConfig.authDomain,
  VITE_FIREBASE_PROJECT_ID: firebaseConfig.projectId,
  VITE_FIREBASE_APP_ID: firebaseConfig.appId,
  VITE_CLOUDINARY_CLOUD_NAME: cloudinary.cloudName,
  VITE_CLOUDINARY_UPLOAD_PRESET: cloudinary.uploadPreset,
  VITE_R2_WORKER_URL: WORKER_URL,
  VITE_ADMIN_EMAIL: ADMIN_EMAIL,
};

export const configProblems = Object.entries(required)
  .filter(([, value]) => !value)
  .map(([key]) => key);
