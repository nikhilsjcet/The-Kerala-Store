import Razorpay from 'razorpay';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    let payment_id = '';
    let custom_key_id = '';
    let custom_key_secret = '';

    if (req.method === 'GET') {
      const url = new URL(req.url, 'http://localhost');
      payment_id = url.searchParams.get('payment_id') || '';
      custom_key_id = url.searchParams.get('key_id') || '';
      custom_key_secret = url.searchParams.get('key_secret') || '';
    } else {
      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch {}
      }
      payment_id = body?.payment_id || '';
      custom_key_id = body?.key_id || '';
      custom_key_secret = body?.key_secret || '';
    }

    const key_id = (custom_key_id || process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || '').trim();
    const key_secret = (custom_key_secret || process.env.RAZORPAY_KEY_SECRET || '').trim();

    if (!key_id || !key_secret) {
      return res.status(400).json({
        success: false,
        exists: false,
        error: 'Razorpay API credentials not configured on server.',
      });
    }

    const razorpay = new Razorpay({
      key_id,
      key_secret,
    });

    // If no payment_id, just test connection with credentials
    if (!payment_id) {
      try {
        const testList = await razorpay.payments.all({ count: 1 });
        return res.status(200).json({
          success: true,
          connection_valid: true,
          key_id: key_id,
          mode: key_id.startsWith('rzp_live_') ? 'live' : 'test',
          message: 'Razorpay credentials are valid and connected!',
          total_payments_found: testList.count || testList.items?.length || 0,
        });
      } catch (authErr) {
        return res.status(401).json({
          success: false,
          connection_valid: false,
          error: authErr?.error?.description || authErr.message || 'Authentication failed. Invalid Key ID or Key Secret.',
        });
      }
    }

    // Inspect the specific payment ID
    try {
      const payment = await razorpay.payments.fetch(payment_id.trim());

      return res.status(200).json({
        success: true,
        exists: true,
        payment: {
          id: payment.id,
          amount: (payment.amount || 0) / 100,
          currency: payment.currency,
          status: payment.status, // captured, authorized, failed, refunded
          method: payment.method, // upi, card, netbanking, wallet
          email: payment.email,
          contact: payment.contact,
          order_id: payment.order_id,
          fee: payment.fee ? payment.fee / 100 : 0,
          tax: payment.tax ? payment.tax / 100 : 0,
          error_code: payment.error_code,
          error_description: payment.error_description,
          created_at: payment.created_at ? new Date(payment.created_at * 1000).toISOString() : null,
          is_test_mode: key_id.startsWith('rzp_test_'),
          captured: Boolean(payment.captured),
        },
      });
    } catch (payErr) {
      const isNotFound = payErr?.statusCode === 400 || payErr?.error?.code === 'BAD_REQUEST_ERROR';
      return res.status(200).json({
        success: true,
        exists: false,
        error: isNotFound
          ? `Payment ID "${payment_id}" was NOT found in your Razorpay account (${key_id.startsWith('rzp_live_') ? 'Live' : 'Test'} mode).`
          : payErr?.error?.description || payErr.message || 'Failed to inspect payment',
      });
    }
  } catch (err) {
    console.error('Check payment error:', err);
    return res.status(500).json({
      success: false,
      exists: false,
      error: err.message || 'Server error checking payment',
    });
  }
}
