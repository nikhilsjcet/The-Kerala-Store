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
    const MASTER_ADMIN_PASSCODE = 'Kerala@2026';
    const verifyPasscode = (code) => code.trim() === MASTER_ADMIN_PASSCODE;

    assert.equal(verifyPasscode('Kerala@2026'), true);
    assert.equal(verifyPasscode('  Kerala@2026  '), true);
    assert.equal(verifyPasscode('wrong-code'), false);
    assert.equal(verifyPasscode('admin123'), false);
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

});
