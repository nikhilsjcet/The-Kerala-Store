import test from 'node:test';
import assert from 'node:assert/strict';

// Test 1: Order Tracking Stepper Logic (Ensuring delivered is green-ticked, next step is golden)
const getStepStatus = (rawStatus, step) => {
  const status = (rawStatus || 'pending').toLowerCase().trim();
  const statusMap = {
    pending: 1,
    processing: 2,
    supplier_ordered: 2,
    shipped: 3,
    out_for_delivery: 4,
    delivered: 5,
  };
  const current = statusMap[status] || 1;

  // When delivered or past 5, ALL 5 steps are completed and green-ticked
  if (status === 'delivered' || current >= 5) {
    return 'completed';
  }

  // Any milestone already achieved or confirmed is green-ticked (completed)
  if (step <= current) {
    return 'completed';
  }

  // The NEXT upcoming status to be achieved is goldened ('current')
  if (step === current + 1) {
    return 'current';
  }

  // Remaining future milestones stay upcoming (gray)
  return 'upcoming';
};

test('Order Tracking Stepper Logic', async (t) => {
  await t.test('When status is delivered, all 5 steps are completed (green-ticked)', () => {
    for (let step = 1; step <= 5; step++) {
      assert.equal(getStepStatus('delivered', step), 'completed', `Step ${step} should be completed`);
    }
  });

  await t.test('When status is pending (Order Confirmed), step 1 is completed, step 2 is golden (next)', () => {
    assert.equal(getStepStatus('pending', 1), 'completed');
    assert.equal(getStepStatus('pending', 2), 'current');
    assert.equal(getStepStatus('pending', 3), 'upcoming');
    assert.equal(getStepStatus('pending', 4), 'upcoming');
    assert.equal(getStepStatus('pending', 5), 'upcoming');
  });

  await t.test('When status is supplier_ordered, steps 1 & 2 are completed, step 3 is golden (next)', () => {
    assert.equal(getStepStatus('supplier_ordered', 1), 'completed');
    assert.equal(getStepStatus('supplier_ordered', 2), 'completed');
    assert.equal(getStepStatus('supplier_ordered', 3), 'current');
    assert.equal(getStepStatus('supplier_ordered', 4), 'upcoming');
    assert.equal(getStepStatus('supplier_ordered', 5), 'upcoming');
  });

  await t.test('When status is shipped, steps 1, 2, 3 are completed, step 4 is golden (next)', () => {
    assert.equal(getStepStatus('shipped', 1), 'completed');
    assert.equal(getStepStatus('shipped', 2), 'completed');
    assert.equal(getStepStatus('shipped', 3), 'completed');
    assert.equal(getStepStatus('shipped', 4), 'current');
    assert.equal(getStepStatus('shipped', 5), 'upcoming');
  });

  await t.test('When status is out_for_delivery, steps 1, 2, 3, 4 are completed, step 5 is golden (next)', () => {
    assert.equal(getStepStatus('out_for_delivery', 1), 'completed');
    assert.equal(getStepStatus('out_for_delivery', 2), 'completed');
    assert.equal(getStepStatus('out_for_delivery', 3), 'completed');
    assert.equal(getStepStatus('out_for_delivery', 4), 'completed');
    assert.equal(getStepStatus('out_for_delivery', 5), 'current');
  });
});

// Test 2: Product Column Sanitization for Supabase
test('Supabase Product Insertion Column Sanitization', async (t) => {
  const SUPABASE_PRODUCT_COLS = [
    'title', 'slug', 'short_description', 'description', 'images',
    'price', 'original_price', 'discount_percentage', 'category_id',
    'tags', 'sku', 'stock_quantity', 'is_featured', 'is_trending',
    'is_new_arrival', 'is_on_sale', 'status', 'supplier_id',
    'supplier_name', 'supplier_cost', 'supplier_url', 'supplier_sku',
    'processing_time_days', 'supplier_order_ref', 'rating', 'review_count',
    'delivery_info', 'return_policy', 'seo_title', 'seo_description',
  ];

  const mockProductInput = {
    title: 'Kerala Kasavu Handloom Saree',
    price: 899,
    original_price: 1499,
    delivery_charge: 50,
    customer_reviews: [{ id: 'rev-1', author: 'Anu', comment: 'Great saree' }],
    category: { id: 'd516f149-0881-4493-83bc-effec2a8f311', name: 'Fashion' },
    category_id: 'cat-fashion',
    variants: [{ id: 'v1', name: 'Free Size' }],
    specifications: { Material: 'Cotton Silk' },
    sku: 'TKS-FASH-001',
  };

  const specsToSave = {
    ...(mockProductInput.specifications || {}),
    _customer_reviews: mockProductInput.customer_reviews || [],
    _delivery_charge: mockProductInput.delivery_charge || 0,
  };

  const supabaseRow = {
    specifications: specsToSave,
  };

  for (const col of SUPABASE_PRODUCT_COLS) {
    if (mockProductInput[col] !== undefined) {
      supabaseRow[col] = mockProductInput[col];
    }
  }

  await t.test('Top-level row must not contain customer_reviews, delivery_charge, category, or variants', () => {
    assert.equal(supabaseRow.customer_reviews, undefined);
    assert.equal(supabaseRow.delivery_charge, undefined);
    assert.equal(supabaseRow.category, undefined);
    assert.equal(supabaseRow.variants, undefined);
  });

  await t.test('customer_reviews and delivery_charge are safely preserved in specifications JSONB', () => {
    assert.deepEqual(supabaseRow.specifications._customer_reviews, mockProductInput.customer_reviews);
    assert.equal(supabaseRow.specifications._delivery_charge, 50);
    assert.equal(supabaseRow.specifications.Material, 'Cotton Silk');
  });

  await t.test('Whitelisted fields are retained accurately', () => {
    assert.equal(supabaseRow.title, 'Kerala Kasavu Handloom Saree');
    assert.equal(supabaseRow.price, 899);
    assert.equal(supabaseRow.sku, 'TKS-FASH-001');
  });
});

