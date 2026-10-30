import Razorpay from 'razorpay';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        return res.status(400).json({ error: 'Invalid JSON request body' });
      }
    }

    const { amount, currency = 'INR', receipt } = body || {};

    // Validate amount (Minimum 100 paise = 1 INR)
    if (!amount || typeof Number(amount) !== 'number' || isNaN(Number(amount)) || Number(amount) < 100) {
      return res.status(400).json({
        error: 'Amount must be at least 100 paise (₹1)',
      });
    }

    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      return res.status(401).json({
        error: 'Razorpay API credentials not configured in environment',
      });
    }

    const razorpay = new Razorpay({
      key_id,
      key_secret,
    });

    const options = {
      amount: Math.round(Number(amount)), // in paise
      currency: currency || 'INR',
      receipt: receipt || `rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: key_id,
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    if (error?.statusCode === 401 || error?.error?.code === 'BAD_REQUEST_ERROR') {
      return res.status(error?.statusCode || 400).json({
        error: error?.error?.description || error.message || 'Razorpay API error',
      });
    }
    return res.status(500).json({
      error: error.message || 'Failed to create Razorpay order',
    });
  }
}

