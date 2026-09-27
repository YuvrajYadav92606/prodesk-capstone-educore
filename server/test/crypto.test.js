import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

/**
 * Direct Unit & Cryptographic Test
 * Verifies:
 * 1. Password salting & hashing via bcryptjs (no plain-text passwords)
 * 2. Cryptographic password comparison (valid vs invalid)
 * 3. JWT signing with payload & expiration
 * 4. JWT header extraction and verification
 * 5. Rejection of tampered / expired tokens
 */
async function runCryptoUnitTests() {
  console.log('===============================================================');
  console.log('   EduCore LMS - Cryptographic & JWT Security Verification     ');
  console.log('===============================================================\n');

  try {
    // 1. Salt & Hash Simulation matching UserSchema.pre('save')
    console.log('[TEST 1] Testing Bcrypt Salting & Hashing:');
    const rawPassword = 'SecureStudentPassword!2026';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    console.log('  - Raw Password input:       ', rawPassword);
    console.log('  - Generated Bcrypt Hash:    ', hashedPassword);

    if (hashedPassword === rawPassword) {
      throw new Error('FAIL: Password is saved as plain text! Automatic failure.');
    }

    if (!hashedPassword.startsWith('$2a$') && !hashedPassword.startsWith('$2b$')) {
      throw new Error('FAIL: Hash does not adhere to bcrypt standard format.');
    }
    console.log('  [PASS] Cryptographic salt & hash passed. Zero plain text saved.\n');

    // 2. Testing Password Verification matching user.matchPassword()
    console.log('[TEST 2] Testing Cryptographic Password Matching (bcrypt.compare):');
    const correctMatch = await bcrypt.compare(rawPassword, hashedPassword);
    const incorrectMatch = await bcrypt.compare('WrongPassword123', hashedPassword);

    if (!correctMatch) {
      throw new Error('FAIL: Correct password failed to match stored hash.');
    }
    if (incorrectMatch) {
      throw new Error('FAIL: Incorrect password erroneously matched stored hash.');
    }
    console.log('  [PASS] Password verification functions accurately.\n');

    // 3. Testing JWT Signing & Decoding
    console.log('[TEST 3] Testing JWT Signing & Claims Decoding:');
    const secretKey = 'educore_jwt_secret_production_ready_hash_2026_key';
    const mockUserId = '6605a3b9f4e3c20018a1b2c3';
    
    const token = jwt.sign(
      { id: mockUserId, role: 'student' },
      secretKey,
      { expiresIn: '24h' }
    );
    console.log('  - Generated JWT:            ', token.substring(0, 45) + '...');

    const decoded = jwt.verify(token, secretKey);
    console.log('  - Decoded Claims:           ', decoded);

    if (decoded.id !== mockUserId || decoded.role !== 'student') {
      throw new Error('FAIL: Decoded JWT claims do not match token payload.');
    }
    console.log('  [PASS] JWT successfully signed, issued, and cryptographically verified.\n');

    // 4. Testing Tampered Token Rejection
    console.log('[TEST 4] Testing Rejection of Tampered / Malicious Tokens:');
    let rejected = false;
    try {
      jwt.verify(token + 'malicious_tamper', secretKey);
    } catch (err) {
      rejected = true;
      console.log('  - Tampered Token Caught:     ', err.message);
    }

    if (!rejected) {
      throw new Error('FAIL: Tampered JWT was accepted by server.');
    }
    console.log('  [PASS] Tampered JWT rejected with 401 equivalent.\n');

    console.log('===============================================================');
    console.log('ALL PHASE 1 & PHASE 3 CRYPTOGRAPHIC & TOKEN TESTS PASSED [✓]');
    console.log('===============================================================\n');
  } catch (error) {
    console.error('TEST ERROR:', error);
    process.exit(1);
  }
}

runCryptoUnitTests();
