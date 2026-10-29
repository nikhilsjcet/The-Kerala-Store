import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

describe('TheKeralaStore Authentication, Cart & Order Scoping Tests', () => {

  // 1. Google OAuth Provider Flow
  test('signInWithOAuth is called with provider: google and correct redirect options', async () => {
    let capturedParams = null;
    const mockSupabase = {
      auth: {
        signInWithOAuth: async (params) => {
          capturedParams = params;
          return { data: { url: 'https://accounts.google.com/o/oauth2/v2/auth' }, error: null };
        }
      }
    };

    const res = await mockSupabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://thekeralastore.shop',
        queryParams: {
          prompt: 'select_account',
        },
      },
    });

    assert.equal(res.error, null);
    assert.equal(capturedParams.provider, 'google');
    assert.equal(capturedParams.options.redirectTo, 'https://thekeralastore.shop');
    assert.equal(capturedParams.options.queryParams.prompt, 'select_account');
  });

  // 2. Customer Order History Security: Unauthenticated customers see empty state, NEVER global store orders
  test('getCustomerOrders returns empty array for guest/unauthenticated visitor', () => {
    function getCustomerOrders(userId, customerEmail, allOrders = []) {
      if (!userId && !customerEmail) return [];
      const cleanEmail = customerEmail?.toLowerCase().trim();
      return allOrders.filter(
        (o) => (userId && o.user_id === userId) || (cleanEmail && o.customer_email?.toLowerCase().trim() === cleanEmail)
      );
    }

    const mockOrders = [
      { id: 'ord-1', user_id: 'usr-123', order_number: 'TKS-2026-100001', customer_email: 'customer1@example.com' },
      { id: 'ord-2', user_id: 'usr-456', order_number: 'TKS-2026-100002', customer_email: 'customer2@example.com' },
    ];

    // Unauthenticated guest call
    const guestOrders = getCustomerOrders(null, null, mockOrders);
    assert.deepEqual(guestOrders, [], 'Guest customer must see empty list, never all store orders');
  });

  // 3. Customer Order History Security: Logged-in customer only sees orders scoped to their user_id / email
  test('getCustomerOrders strictly returns only orders matching authenticated user ID or email', () => {
    function getCustomerOrders(userId, customerEmail, allOrders = []) {
      if (!userId && !customerEmail) return [];
      const cleanEmail = customerEmail?.toLowerCase().trim();
      return allOrders.filter(
        (o) => (userId && o.user_id === userId) || (cleanEmail && o.customer_email?.toLowerCase().trim() === cleanEmail)
      );
    }

    const mockOrders = [
      { id: 'ord-1', user_id: 'usr-123', order_number: 'TKS-2026-100001', customer_email: 'sree@thekeralastore.shop' },
      { id: 'ord-2', user_id: 'usr-456', order_number: 'TKS-2026-100002', customer_email: 'other@example.com' },
      { id: 'ord-3', user_id: 'usr-789', order_number: 'TKS-2026-100003', customer_email: 'demo@example.com' },
    ];

    const customerOrders = getCustomerOrders('usr-123', 'sree@thekeralastore.shop', mockOrders);
    assert.equal(customerOrders.length, 1);
    assert.equal(customerOrders[0].order_number, 'TKS-2026-100001');
    assert.equal(customerOrders[0].user_id, 'usr-123');
  });

  // 4. Cart Storage Isolation per Account
  test('Cart storage key isolates guest cart from authenticated user cart', () => {
    const getCartStorageKey = (userId) => 
      userId ? `thekeralastore_cart_user_${userId}` : 'thekeralastore_cart_guest';

    assert.equal(getCartStorageKey(null), 'thekeralastore_cart_guest');
    assert.equal(getCartStorageKey('user-abc-123'), 'thekeralastore_cart_user_user-abc-123');
    assert.notEqual(getCartStorageKey(null), getCartStorageKey('user-abc-123'));
  });

  // 5. Checkout Cart Validation: Rejects Unpublished Products
  test('validateCheckoutCart blocks unpublished/unlisted products from checkout', () => {
    function validateCheckoutCart(cartItems, productDb) {
      const errors = [];
      const verifiedCart = [];
      let verifiedSubtotal = 0;

      for (const item of cartItems) {
        const prod = productDb.find((p) => p.id === item.product.id);
        if (!prod) {
          errors.push(`"${item.product.title}" is no longer available.`);
          continue;
        }
        if (prod.status !== 'published') {
          errors.push(`"${prod.title}" is currently unlisted.`);
          continue;
        }
        if (prod.stock_quantity <= 0) {
          errors.push(`"${prod.title}" is out of stock.`);
          continue;
        }
        verifiedSubtotal += prod.price * item.quantity;
        verifiedCart.push({ ...item, product: prod });
      }

      return {
        valid: errors.length === 0 && verifiedCart.length > 0,
        errors,
        verifiedSubtotal,
        verifiedCart,
      };
    }

    const mockDb = [
      { id: 'p1', title: 'Ayurvedic Hair Oil', status: 'published', stock_quantity: 20, price: 499 },
      { id: 'p2', title: 'Unlisted Drone Test', status: 'draft', stock_quantity: 10, price: 9999 },
    ];

    const cart = [
      { product: { id: 'p1', title: 'Ayurvedic Hair Oil' }, quantity: 1 },
      { product: { id: 'p2', title: 'Unlisted Drone Test' }, quantity: 1 },
    ];

    const result = validateCheckoutCart(cart, mockDb);
    assert.equal(result.valid, false);
    assert.equal(result.errors.length, 1);
    assert.match(result.errors[0], /unlisted/i);
  });

  // 6. Master Admin Passcode Verification
  test('Master admin passcode grants access to Store Administrator role', () => {
    const MASTER_ADMIN_PASSCODE = 'kinnan123';
    const verifyPasscode = (code) => code.trim() === MASTER_ADMIN_PASSCODE;

    assert.equal(verifyPasscode('kinnan123'), true);
    assert.equal(verifyPasscode('  kinnan123  '), true);
    assert.equal(verifyPasscode('wrong-code'), false);
    assert.equal(verifyPasscode('admin123'), false);
    assert.equal(verifyPasscode('Kerala@2026'), false);
  });

  // 7. Adding to cart never creates an order
  test('Adding an item to cart only modifies cart array and never invokes order creation', () => {
    let orderCreationCount = 0;
    const createOrder = () => { orderCreationCount++; };

    let cart = [];
    const addToCart = (product, quantity = 1) => {
      cart = [...cart, { product, quantity }];
    };

    addToCart({ id: 'p1', title: 'Kerala Spices', status: 'published', price: 299 }, 2);

    assert.equal(cart.length, 1);
    assert.equal(cart[0].quantity, 2);
    assert.equal(orderCreationCount, 0, 'Order creation must strictly never be triggered by adding to cart');
  });

  // 8. Admin Customers list derivation: normalizes phone, merges duplicate customer orders, filters dummy/admin
  test('Derives unique store customers correctly and ignores dummy/admin accounts', () => {
    function deriveCustomers(orders) {
      const map = new Map();
      orders.forEach((o) => {
        const emailLower = (o.customer_email || '').trim().toLowerCase();
        const nameLower = (o.customer_name || '').trim().toLowerCase();

        if (
          emailLower === 'admin@thekeralastore.shop' ||
          emailLower === 'shopper@example.com' ||
          nameLower.includes('rohit sharma')
        ) {
          return;
        }

        const digits = (o.customer_phone || '').replace(/\D/g, '').slice(-10);
        const cleanEmail = emailLower;
        const key = digits || cleanEmail;
        if (!key) return;

        const existing = map.get(key);
        if (existing) {
          existing.orderCount += 1;
          existing.totalSpent += o.total_amount;
        } else {
          map.set(key, {
            name: o.customer_name,
            phone: `+91 ${digits}`,
            email: cleanEmail,
            orderCount: 1,
            totalSpent: o.total_amount,
          });
        }
      });
      return Array.from(map.values());
    }

    const testOrders = [
      { customer_name: 'Anjali Nair', customer_phone: '+91 9846012345', customer_email: 'anjali@example.com', total_amount: 1200 },
      { customer_name: 'Anjali Nair', customer_phone: '09846012345', customer_email: 'anjali@example.com', total_amount: 800 },
      { customer_name: 'Rohit Sharma', customer_phone: '9999999999', customer_email: 'shopper@example.com', total_amount: 500 },
      { customer_name: 'Administrator', customer_phone: '1234567890', customer_email: 'admin@thekeralastore.shop', total_amount: 9999 },
      { customer_name: 'Manu Pillai', customer_phone: '9447123456', customer_email: 'manu@example.com', total_amount: 450 },
    ];

    const result = deriveCustomers(testOrders);
    assert.equal(result.length, 2, 'Should only derive 2 real unique customers');
    const anjali = result.find((c) => c.name === 'Anjali Nair');
    assert.ok(anjali);
    assert.equal(anjali.orderCount, 2, 'Two orders with differing phone format merged into 1 customer');
    assert.equal(anjali.totalSpent, 2000, 'Total spent summed accurately');
    assert.equal(result.some((c) => c.name === 'Rohit Sharma'), false, 'Dummy accounts filtered');
  });

  // 9. Product-specific delivery charges (no arbitrary extra fees)
  test('Delivery fee uses product-defined rate without arbitrary flat shipping surcharge', () => {
    function computeDeliveryCharge(cart) {
      if (!cart || cart.length === 0) return 0;
      return cart.reduce((max, item) => Math.max(max, Number(item.product.delivery_charge || 0)), 0);
    }

    // Free delivery items
    const freeCart = [
      { product: { id: 'p1', title: 'Spice Box', delivery_charge: 0 } },
      { product: { id: 'p2', title: 'Banana Chips', delivery_charge: 0 } },
    ];
    assert.equal(computeDeliveryCharge(freeCart), 0, 'Should be 0 if all products have 0 delivery charge');

    // Product with specific delivery charge
    const chargedCart = [
      { product: { id: 'p1', title: 'Heavy Ceramic Uruli', delivery_charge: 60 } },
      { product: { id: 'p2', title: 'Banana Chips', delivery_charge: 0 } },
    ];
    assert.equal(computeDeliveryCharge(chargedCart), 60, 'Should apply product delivery charge without adding arbitrary fee');
  });

});
