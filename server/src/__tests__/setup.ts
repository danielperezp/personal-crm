export function setup() {
  process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
  process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
  process.env.FIREBASE_PROJECT_ID = 'nexus-test';
  process.env.FIREBASE_CLIENT_EMAIL = 'test@test.com';
  process.env.FIREBASE_PRIVATE_KEY = '-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA0Z3VS5JJcds3xHn/ygWep4PAtEsHABBBBBBBBBBBBBBBBBBB\n-----END RSA PRIVATE KEY-----\n';
}
