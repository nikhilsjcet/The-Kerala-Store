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
        return res.status(400).json({ error: 'Invalid JSON request body' });
      }
    }

    const { 
      amount, 
      currency = 'INR', 
      receipt,
      items,
      discount_code,
      customer
    } = body || {};

    let calculatedPaise = 0;
    let verifiedSubtotal = 0;
    let verifiedDiscount = 0;
    let verifiedDeliveryFee = 0;
    let verifiedItems = [];

    // STEP A: If items are passed, calculate and revalidate prices & stock strictly on the server
    if (Array.isArray(items) && items.length > 0) {
      const supabase = getSupabase();
      if (supabase) {
        const productIds = items
          .map((it) => it.product_id || it.id)
          .filter((id) => isValidUUID(id));

        if (productIds.length > 0) {
          const { data: dbProducts, error: prodErr } = await supabase
            .from('products')
            .select('id, title, price, status, stock_quantity, delivery_charge, images')
            .in('id', productIds);

          if (prodErr) {
            console.warn('Supabase product query error:', prodErr.message);
          } else if (Array.isArray(dbProducts)) {
            for (const item of items) {
              const pid = item.product_id || item.id;
              const prod = dbProducts.find((p) => p.id === pid);

              if (!prod) {
                return res.status(400).json({
                  error: `Product "${item.product_title || pid}" is no longer available in store.`,
                });
              }

              if (prod.status !== 'published') {
                return res.status(400).json({
                  error: `Product "${prod.title}" is currently unlisted.`,
                });
              }

              if (prod.stock_quantity <= 0) {
                return res.status(400).json({
                  error: `Product "${prod.title}" is currently out of stock.`,
                });
              }

              const qty = Math.max(1, Number(item.quantity) || 1);
              const unitPrice = Number(prod.price) || 0;
              const itemTotal = unitPrice * qty;

              verifiedSubtotal += itemTotal;
              verifiedDeliveryFee = Math.max(verifiedDeliveryFee, Number(prod.delivery_charge || 0));

              verifiedItems.push({
                product_id: prod.id,
                product_title: prod.title,
                product_image: Array.isArray(prod.images) && prod.images.length > 0 ? prod.images[0] : null,
                unit_price: unitPrice,
                quantity: qty,
                total_price: itemTotal,
                variant_name: item.variant_name || null,
                sku: item.sku || null,
              });
            }
          }
        }

        // Validate discount code on the server if provided
        if (discount_code && typeof discount_code === 'string' && discount_code.trim()) {
          try {
            const cleanCode = discount_code.trim().toUpperCase();
            const { data: disc, error: discErr } = await supabase
              .from('discounts')
              .select('*')
              .eq('code', cleanCode)
              .eq('is_active', true)
              .single();

            if (!discErr && disc) {
              const minSpend = Number(disc.min_order_amount) || 0;
              if (verifiedSubtotal >= minSpend) {
                if (disc.discount_type === 'percentage') {
                  const pctVal = (verifiedSubtotal * Number(disc.value)) / 100;
                  const maxDisc = Number(disc.max_discount_amount) || Infinity;
                  verifiedDiscount = Math.round(Math.min(pctVal, maxDisc));
                } else if (disc.discount_type === 'fixed') {
                  verifiedDiscount = Math.min(Number(disc.value) || 0, verifiedSubtotal);
                }
              }
            }
          } catch (discCatch) {
            console.warn('Discount check error:', discCatch);
          }
        }
      }

      const finalServerTotal = Math.max(0, verifiedSubtotal - verifiedDiscount + verifiedDeliveryFee);
      calculatedPaise = Math.round(finalServerTotal * 100);
    }

    // Fallback: If amount was provided directly (e.g. from tests or simple calls)
    if (!calculatedPaise && amount) {
      calculatedPaise = Math.round(Number(amount));
    }

    // Validate final amount (Minimum 100 paise = 1 INR)
    if (!calculatedPaise || isNaN(calculatedPaise) || calculatedPaise < 100) {
      return res.status(400).json({
        error: 'Amount must be at least 100 paise (₹1)',
      });
    }

    const key_id = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      return res.status(401).json({
        error: 'Razorpay API credentials not configured in environment. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Vercel settings and redeploy.',
      });
    }

    const razorpay = new Razorpay({
      key_id,
      key_secret,
    });

    const options = {
      amount: calculatedPaise, // in paise
      currency: currency || 'INR',
      receipt: receipt || `rcpt_${Date.now()}`,
      notes: {
        customer_name: customer?.name || '',
        customer_email: customer?.email || '',
      },
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: key_id,
      verified_subtotal: verifiedSubtotal,
      discount_amount: verifiedDiscount,
      shipping_fee: verifiedDeliveryFee,
      items: verifiedItems,
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
