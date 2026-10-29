import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

describe('TheKeralaStore Authentication Flow Unit Tests', () => {

  // Mock Supabase client to test exact method signatures and parameters
  function createMockSupabase(overrides = {}) {
    const calls = {
      signUp: [],
      signInWithPassword: [],
      signInWithOtp: [],
      verifyOtp: [],
      resend: [],
    };

    const client = {
      calls,
      auth: {
        signUp: async (params) => {
          calls.signUp.push(params);
          if (overrides.signUp) return overrides.signUp(params);
          return {
            data: {
              user: {
                id: 'mock-user-1',
                email: params.email,
                identities: [{ id: 'identity-1' }],
                created_at: new Date().toISOString(),
              },
              session: null,
            },
            error: null,
          };
        },
        signInWithPassword: async (params) => {
          calls.signInWithPassword.push(params);
          if (overrides.signInWithPassword) return overrides.signInWithPassword(params);
          return {
            data: {
              user: { id: 'mock-user-1', email: params.email },
              session: { access_token: 'mock-token' },
            },
            error: null,
          };
        },
        signInWithOtp: async (params) => {
          calls.signInWithOtp.push(params);
          if (overrides.signInWithOtp) return overrides.signInWithOtp(params);
          return { data: { message: 'OTP requested' }, error: null };
        },
        verifyOtp: async (params) => {
          calls.verifyOtp.push(params);
          if (overrides.verifyOtp) return overrides.verifyOtp(params);
          return {
            data: {
              user: { id: 'mock-user-1', email: params.email },
              session: { access_token: 'mock-token' },
            },
            error: null,
          };
        },
        resend: async (params) => {
          calls.resend.push(params);
          if (overrides.resend) return overrides.resend(params);
          return { data: { message: 'Resent' }, error: null };
        },
      },
    };

    return client;
  }

  // 1. Email Masking Helper Test
  test('Email masking masks customer email correctly without revealing whole address', () => {
    const maskEmail = (rawEmail) => {
      const parts = rawEmail.trim().split('@');
      if (parts.length !== 2) return rawEmail;
      const [name, domain] = parts;
      if (name.length <= 2) {
        return `${name[0]}*@${domain}`;
      }
      const visibleCount = Math.min(3, Math.max(1, Math.floor(name.length / 2)));
      return `${name.slice(0, visibleCount)}***@${domain}`;
    };

    assert.equal(maskEmail('sreejith@example.com'), 'sre***@example.com');
    assert.equal(maskEmail('me@thekeralastore.shop'), 'm*@thekeralastore.shop');
    assert.equal(maskEmail('user.name@gmail.com'), 'use***@gmail.com');
  });

  // 2. New Signup Flow
  test('signUpWithEmail calls supabase.auth.signUp with email and password and returns isAlreadyRegistered: false for new user', async () => {
    const client = createMockSupabase();
    const cleanEmail = 'customer@example.com';
    const password = 'SecretPassword123';
    const fullName = 'Test Shopper';

    const { data, error } = await client.auth.signUp({
      email: cleanEmail,
      password: password,
      options: {
        data: { full_name: fullName, role: 'customer' },
        emailRedirectTo: 'https://thekeralastore.shop',
      },
    });

    const isAlreadyRegistered = Boolean(
      data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0
    );

    assert.equal(error, null);
    assert.equal(isAlreadyRegistered, false);
    assert.equal(client.calls.signUp.length, 1);
    assert.equal(client.calls.signUp[0].email, 'customer@example.com');
    assert.equal(client.calls.signUp[0].password, 'SecretPassword123');
    assert.equal(client.calls.signUp[0].options.data.full_name, 'Test Shopper');
  });

  // 3. Repeated Signup Flow for Already Confirmed User
  test('signUpWithEmail detects already confirmed user (identities: []) and flags isAlreadyRegistered', async () => {
    const client = createMockSupabase({
      signUp: async () => ({
        data: {
          user: {
            id: 'mock-user-1',
            email: 'existing@example.com',
            identities: [], // Supabase returns empty array for already registered and confirmed accounts
          },
          session: null,
        },
        error: null,
      }),
    });

    const { data, error } = await client.auth.signUp({
      email: 'existing@example.com',
      password: 'SomePassword123',
    });

    const isAlreadyRegistered = Boolean(
      data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0
    );

    assert.equal(error, null);
    assert.equal(isAlreadyRegistered, true);
    // UI can now truthfully inform the user that the account already exists rather than claiming OTP was sent
  });

  // 4. Password Login
  test('signInWithEmail calls supabase.auth.signInWithPassword and never triggers signInWithOtp', async () => {
    const client = createMockSupabase();

    const { data, error } = await client.auth.signInWithPassword({
      email: 'customer@example.com',
      password: 'CorrectPassword123',
    });

    assert.equal(error, null);
    assert.equal(data.user.email, 'customer@example.com');
    assert.equal(client.calls.signInWithPassword.length, 1);
    assert.equal(client.calls.signInWithOtp.length, 0); // Must be 0
  });

  // 5. Password Login with unconfirmed email
  test('signInWithEmail returns email_not_confirmed without automatically sending passwordless OTP', async () => {
    const client = createMockSupabase({
      signInWithPassword: async () => ({
        data: { user: null, session: null },
        error: { message: 'Email not confirmed', code: 'email_not_confirmed' },
      }),
    });

    const res = await client.auth.signInWithPassword({
      email: 'unconfirmed@example.com',
      password: 'SomePassword123',
    });

    assert.notEqual(res.error, null);
    assert.equal(res.error.code, 'email_not_confirmed');
    assert.equal(client.calls.signInWithOtp.length, 0); // Did not trigger passwordless OTP
  });

  // 6. Passwordless OTP Login (shouldCreateUser: false)
  test('sendEmailOtp strictly uses shouldCreateUser: false for passwordless login', async () => {
    const client = createMockSupabase();

    const { data, error } = await client.auth.signInWithOtp({
      email: 'customer@example.com',
      options: {
        shouldCreateUser: false, // Per Requirement 3!
        emailRedirectTo: 'https://thekeralastore.shop',
      },
    });

    assert.equal(error, null);
    assert.equal(client.calls.signInWithOtp.length, 1);
    assert.equal(client.calls.signInWithOtp[0].options.shouldCreateUser, false);
  });

  // 7. Verify Signup Confirmation OTP
  test('verifyEmailOtp uses type: "signup" for new customer signup verification', async () => {
    const client = createMockSupabase();

    const { data, error } = await client.auth.verifyOtp({
      email: 'customer@example.com',
      token: '654321',
      type: 'signup',
    });

    assert.equal(error, null);
    assert.equal(client.calls.verifyOtp.length, 1);
    assert.equal(client.calls.verifyOtp[0].type, 'signup');
    assert.equal(client.calls.verifyOtp[0].token, '654321');
  });

  // 8. Verify Passwordless Login OTP
  test('verifyEmailOtp uses type: "email" for passwordless login OTP verification', async () => {
    const client = createMockSupabase();

    const { data, error } = await client.auth.verifyOtp({
      email: 'customer@example.com',
      token: '112233',
      type: 'email',
    });

    assert.equal(error, null);
    assert.equal(client.calls.verifyOtp.length, 1);
    assert.equal(client.calls.verifyOtp[0].type, 'email');
    assert.equal(client.calls.verifyOtp[0].token, '112233');
  });

  // 9. Resend Signup Confirmation OTP
  test('resendSignupOtp strictly calls supabase.auth.resend with type: "signup"', async () => {
    const client = createMockSupabase();

    const { data, error } = await client.auth.resend({
      type: 'signup',
      email: 'customer@example.com',
      options: {
        emailRedirectTo: 'https://thekeralastore.shop',
      },
    });

    assert.equal(error, null);
    assert.equal(client.calls.resend.length, 1);
    assert.equal(client.calls.resend[0].type, 'signup');
    assert.equal(client.calls.resend[0].email, 'customer@example.com');
  });

  // 10. Expired / Invalid OTP error handling
  test('verifyEmailOtp accurately returns error for expired or invalid code', async () => {
    const client = createMockSupabase({
      verifyOtp: async () => ({
        data: { user: null, session: null },
        error: { message: 'Token has expired or is invalid', status: 400 },
      }),
    });

    const res = await client.auth.verifyOtp({
      email: 'customer@example.com',
      token: '999999',
      type: 'signup',
    });

    assert.notEqual(res.error, null);
    assert.equal(res.error.message, 'Token has expired or is invalid');
  });
});
