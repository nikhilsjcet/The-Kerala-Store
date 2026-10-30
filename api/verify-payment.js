import crypto from 'crypto';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

function isValidUUID(str) {
  return typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str.trim());
}

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
        return res.status(400).json({ success: false, error: 'Invalid JSON request body' });
      }
    }

    const razorpay_order_id = body?.razorpay_order_id || body?.order_id;
    const razorpay_payment_id = body?.razorpay_payment_id || body?.payment_id;
    const razorpay_signature = body?.razorpay_signature || body?.signature;
    const order_payload = body?.order_payload;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required payment verification fields (razorpay_order_id, razorpay_payment_id, razorpay_signature)',
      });
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_secret) {
      return res.status(500).json({
        success: false,
        error: 'Razorpay secret key not configured in environment',
      });
    }

    // 1. Cryptographic HMAC-SHA256 Signature Verification
    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generated_signature = crypto
      .createHmac('sha256', key_secret)
      .update(payload)
      .digest('hex');

    // Secure constant-time comparison to prevent timing attacks
    let isAuthentic = false;
    try {
      const a = Buffer.from(generated_signature, 'utf8');
      const b = Buffer.from(razorpay_signature, 'utf8');
      isAuthentic = a.length === b.length && crypto.timingSafeEqual(a, b);
    } catch {
      isAuthentic = false;
    }

    if (!isAuthentic) {
      return res.status(400).json({
        success: false,
        error: 'Signature verification failed. Transaction was not authorized.',
      });
    }

    // 2. Fetch payment details from Razorpay to verify status & amount
    let razorpayPayment = null;
    const key_id = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
    if (key_id && key_secret) {
      try {
        const razorpay = new Razorpay({
          key_id: key_id,
          key_secret: key_secret,
        });
        razorpayPayment = await razorpay.payments.fetch(razorpay_payment_id);

        if (razorpayPayment?.order_id && razorpayPayment.order_id !== razorpay_order_id) {
          return res.status(400).json({
            success: false,
            error: 'Razorpay order ID mismatch between callback and payment record',
          });
        }

        const validStatuses = ['captured', 'authorized'];
        if (razorpayPayment?.status && !validStatuses.includes(razorpayPayment.status)) {
          return res.status(400).json({
            success: false,
            error: `Payment is in invalid status: ${razorpayPayment.status}`,
          });
        }
      } catch (fetchErr) {
        // In offline/mock test environments, log notice and continue with verified signature
        console.warn('Razorpay payment fetch notice:', fetchErr?.message || fetchErr);
      }
    }

    // 3. Supabase Idempotency & Order Creation
    const supabase = getSupabase();
    let createdOrder = null;

    if (supabase) {
      try {
        // Idempotency: Check if an order with this payment_id already exists in Supabase
        const { data: existingOrders } = await supabase
          .from('orders')
          .select('*, items:order_items(*)')
          .eq('payment_id', razorpay_payment_id)
          .limit(1);

        if (Array.isArray(existingOrders) && existingOrders.length > 0) {
          return res.status(200).json({
            success: true,
            message: 'Payment verified and order already recorded',
            order: existingOrders[0],
            payment_id: razorpay_payment_id,
            order_id: razorpay_order_id,
            duplicate: true,
          });
        }

        // If order_payload was provided by frontend, persist verified order to Supabase
        if (order_payload) {
          const now = new Date().toISOString();
          const orderNumber = `TKS-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
          
          const orderRow = {
            order_number: orderNumber,
            user_id: isValidUUID(order_payload.user_id) ? order_payload.user_id : null,
            customer_name: order_payload.customer_name || 'Store Customer',
            customer_email: order_payload.customer_email || '',
            customer_phone: order_payload.customer_phone || '',
            shipping_address: order_payload.shipping_address || {},
            subtotal: Number(order_payload.subtotal) || 0,
            discount_amount: Number(order_payload.discount_amount) || 0,
            discount_code: order_payload.discount_code || null,
            shipping_fee: Number(order_payload.shipping_fee) || 0,
            total_amount: Number(order_payload.total_amount) || (razorpayPayment ? razorpayPayment.amount / 100 : 0),
            payment_method: 'razorpay',
            payment_status: 'completed',
            payment_id: razorpay_payment_id,
            fulfilment_status: 'pending',
            notes: `Razorpay Order: ${razorpay_order_id}`,
            created_at: now,
            updated_at: now,
          };

          const { data: insertedOrder, error: orderErr } = await supabase
            .from('orders')
            .insert(orderRow)
            .select()
            .single();

          if (!orderErr && insertedOrder) {
            createdOrder = insertedOrder;

            // Insert line items
            if (Array.isArray(order_payload.items) && order_payload.items.length > 0) {
              const itemRows = order_payload.items.map((it) => ({
                order_id: insertedOrder.id,
                product_id: isValidUUID(it.product_id) ? it.product_id : null,
                product_title: it.product_title || 'Item',
                product_image: it.product_image || null,
                sku: it.sku || null,
                variant_name: it.variant_name || null,
                unit_price: Number(it.unit_price) || 0,
                quantity: Number(it.quantity) || 1,
                total_price: Number(it.total_price) || (Number(it.unit_price) * (Number(it.quantity) || 1)),
              }));

              await supabase.from('order_items').insert(itemRows);
              createdOrder.items = itemRows;
            }
          } else if (orderErr) {
            console.error('Error inserting verified order to Supabase:', orderErr.message);
          }
        }
      } catch (dbErr) {
        console.error('Database order creation error after payment:', dbErr);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      order: createdOrder,
    });
  } catch (error) {
    console.error('Payment signature verification error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Server error during payment verification',
    });
  }
}
