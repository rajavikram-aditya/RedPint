const admin = require('firebase-admin');

// Initialize Firebase Admin SDK using environment variables.
// For production, you can also point to a service account JSON file.
const firebaseApp = admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // The private key comes as a string with escaped newlines in .env;
    // we need to replace \\n with real newlines.
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

const auth = admin.auth();
const bucket = admin.storage().bucket();

module.exports = { admin, auth, bucket };
