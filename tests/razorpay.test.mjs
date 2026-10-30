import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';
import createOrderHandler from '../api/create-order.js';
import verifyPaymentHandler from '../api/verify-payment.js';

describe('Razorpay Standard Web Checkout Integration Tests', () => {

  const MOCK_KEY_ID = 'rzp_test_Tu1g2T6xlHBMj3';
  const MOCK_KEY_SECRET = 'FSTJS9M2kB06sHq4Id4mz5jJ';

  function createMockRes() {
    let statusCode = 200;
    let headers = {};
    let responseBody = null;
    let ended = false;

    return {
      setHeader: (k, v) => { headers[k] = v; },
      status: (code) => {
        statusCode = code;
        return {
          json: (data) => {
            responseBody = data;
            ended = true;
          },
          end: () => {
            ended = true;
          }
        };
      },
      end: (data) => {
        if (data) {
          try { responseBody = JSON.parse(data); } catch { responseBody = data; }
        }
        ended = true;
      },
      getStatus: () => statusCode,
      getBody: () => responseBody,
      isEnded: () => ended
    };
  }

  // 1. Minimum amount validation on /api/create-order
  test('POST /api/create-order rejects amounts under 100 paise with HTTP 400', async () => {
    process.env.RAZORPAY_KEY_ID = MOCK_KEY_ID;
    process.env.RAZORPAY_KEY_SECRET = MOCK_KEY_SECRET;

    const req = {
      method: 'POST',
      body: { amount: 50, currency: 'INR' } // 50 paise is < 100 paise
    };
    const res = createMockRes();

    await createOrderHandler(req, res);

    assert.equal(res.getStatus(), 400);
    assert.match(res.getBody().error, /100 paise/i);
  });

  // 2. HTTP Method validation on /api/create-order
  test('GET /api/create-order rejects non-POST requests with HTTP 405', async () => {
    const req = { method: 'GET' };
    const res = createMockRes();

    await createOrderHandler(req, res);

    assert.equal(res.getStatus(), 405);
  });

  // 3. Missing credentials handling on /api/create-order
  test('POST /api/create-order returns HTTP 401 when environment credentials are unset', async () => {
    const prevKey = process.env.RAZORPAY_KEY_ID;
    const prevSec = process.env.RAZORPAY_KEY_SECRET;
    delete process.env.RAZORPAY_KEY_ID;
    delete process.env.RAZORPAY_KEY_SECRET;

    const req = {
      method: 'POST',
      body: { amount: 50000, currency: 'INR' }
    };
    const res = createMockRes();

    await createOrderHandler(req, res);

    assert.equal(res.getStatus(), 401);
    assert.match(res.getBody().error, /credentials/i);

    // Restore
    process.env.RAZORPAY_KEY_ID = prevKey;
    process.env.RAZORPAY_KEY_SECRET = prevSec;
  });

  // 4. Missing verification fields on /api/verify-payment
  test('POST /api/verify-payment returns HTTP 400 if fields are missing', async () => {
    const req = {
      method: 'POST',
      body: { razorpay_order_id: 'order_123' } // missing payment_id and signature
    };
    const res = createMockRes();

    await verifyPaymentHandler(req, res);

    assert.equal(res.getStatus(), 400);
    assert.match(res.getBody().error, /missing/i);
  });

  // 5. Signature mismatch rejection on /api/verify-payment
  test('POST /api/verify-payment rejects tampered/invalid signature with HTTP 400', async () => {
    process.env.RAZORPAY_KEY_SECRET = MOCK_KEY_SECRET;

    const req = {
      method: 'POST',
      body: {
        razorpay_order_id: 'order_ABC123',
        razorpay_payment_id: 'pay_XYZ789',
        razorpay_signature: 'fake_tampered_signature_hex'
      }
    };
    const res = createMockRes();

    await verifyPaymentHandler(req, res);

    assert.equal(res.getStatus(), 400);
    assert.equal(res.getBody().success, false);
    assert.match(res.getBody().error, /verification failed/i);
  });

  // 6. Valid HMAC-SHA256 signature verification on /api/verify-payment
  test('POST /api/verify-payment succeeds with HTTP 200 when signature matches HMAC-SHA256', async () => {
    process.env.RAZORPAY_KEY_SECRET = MOCK_KEY_SECRET;

    const orderId = 'order_valid_998877';
    const paymentId = 'pay_valid_112233';

    // Generate expected HMAC-SHA256 signature
    const validSignature = crypto
      .createHmac('sha256', MOCK_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const req = {
      method: 'POST',
      body: {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: validSignature
      }
    };
    const res = createMockRes();

    await verifyPaymentHandler(req, res);

    assert.equal(res.getStatus(), 200);
    assert.equal(res.getBody().success, true);
    assert.equal(res.getBody().payment_id, paymentId);
    assert.equal(res.getBody().order_id, orderId);
  });

});

