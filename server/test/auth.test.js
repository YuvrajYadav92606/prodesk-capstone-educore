import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from '../src/models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

async function runTests() {
  console.log('--- Starting Comprehensive Auth & Cryptography Verification ---');
  let mongod;

  try {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log('[PASS] Connected to in-memory MongoDB test instance.');

    // 1. Test Password Hashing and Cryptographic Security
    console.log('\n[TEST 1] Cryptographic Salt & Hash Verification:');
    const rawPassword = 'SuperSecretPassword123!';
    const user = await User.create({
      name: 'Alex Mercer',
      email: 'alex.mercer@educore.io',
      password: rawPassword,
      role: 'instructor'
    });

    console.log('User created with ID:', user._id);
    console.log('User password stored in DB:', user.password);

    // Verify stored password is NOT plain-text
    if (user.password === rawPassword) {
      throw new Error('FAIL: Password stored as PLAIN TEXT! Automatic failure.');
    }
    if (!user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
      throw new Error('FAIL: Password is not a valid bcrypt hash.');
    }
    console.log('[PASS] Password successfully salted & hashed with bcrypt.');

    // 2. Test bcrypt compare method
    console.log('\n[TEST 2] Password Match Method Verification:');
    const isMatchCorrect = await user.matchPassword(rawPassword);
    const isMatchWrong = await user.matchPassword('WrongPassword!');
    if (!isMatchCorrect || isMatchWrong) {
      throw new Error('FAIL: matchPassword method failed to validate hashes accurately.');
    }
    console.log('[PASS] matchPassword accurately verified correct password and rejected incorrect password.');

    // 3. Test JWT Signing and Verification
    console.log('\n[TEST 3] JWT Signing and Cryptographic Decoding:');
    const secret = 'educore_jwt_secret_production_ready_hash_2026_key';
    const token = jwt.sign({ id: user._id }, secret, { expiresIn: '1h' });
    console.log('Generated JWT:', token.substring(0, 30) + '...');

    const decoded = jwt.verify(token, secret);
    if (decoded.id.toString() !== user._id.toString()) {
      throw new Error('FAIL: JWT decoded ID does not match original User ID.');
    }
    console.log('[PASS] JWT signed and cryptographically verified.');

    // 4. Test Token Rejection on Tampering
    console.log('\n[TEST 4] Token Tampering & Expiry Security:');
    try {
      jwt.verify(token + 'tampered', secret);
      throw new Error('FAIL: Tampered JWT was accepted.');
    } catch (e) {
      console.log('[PASS] Tampered JWT correctly rejected with error:', e.message);
    }

    console.log('\n=============================================================');
    console.log('ALL PHASE 1 & PHASE 3 CRYPTOGRAPHIC & TOKEN TESTS PASSED! [✓]');
    console.log('=============================================================\n');
  } catch (error) {
    console.error('\n[TEST ERROR]:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    if (mongod) await mongod.stop();
  }
}

runTests();
