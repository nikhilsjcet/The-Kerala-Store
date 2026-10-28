import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, ProductVariant, DiscountCode } from '../types';
import { StoreService } from '../services/storeService';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, variant?: ProductVariant) => void;
  removeFromCart: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
  shippingFee: number;
  freeShippingThreshold: number;
  freeShippingRemaining: number;
  discountCode: string;
  discountAmount: number;
  appliedDiscount: DiscountCode | null;
  discountMessage: string;
  applyDiscount: (code: string) => Promise<boolean>;
  removeDiscount: () => void;
  total: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY_CART = 'thekeralastore_cart_items';
const STORAGE_KEY_WISHLIST = 'thekeralastore_wishlist_items';
const FREE_SHIPPING_THRESHOLD = 999;
const STANDARD_SHIPPING_FEE = 99;

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CART);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY_WISHLIST);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountCode | null>(null);
  const [discountMessage, setDiscountMessage] = useState('');

  // Persist cart
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CART, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart:', e);
    }
  }, [cart]);

  // Persist wishlist
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_WISHLIST, JSON.stringify(wishlist));
    } catch (e) {
      console.error('Failed to save wishlist:', e);
    }
  }, [wishlist]);

  const addToCart = (product: Product, quantity = 1, variant?: ProductVariant) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.variant?.id === variant?.id
      );

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += quantity;
        return next;
      }

      return [
        ...prev,
        {
          product,
          variant,
          quantity,
        },
      ];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, variantId?: string) => {
    setCart((prev) =>
      prev.filter(
        (item) => !(item.product.id === productId && item.variant?.id === variantId)
      )
    );
  };

  const updateQuantity = (productId: string, quantity: number, variantId?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId && item.variant?.id === variantId) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setDiscountCode('');
    setDiscountAmount(0);
    setAppliedDiscount(null);
    setDiscountMessage('');
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cart.reduce((sum, item) => {
    const itemPrice = item.variant?.price || item.product.price;
    return sum + itemPrice * item.quantity;
  }, 0);

  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : STANDARD_SHIPPING_FEE;
  const freeShippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const applyDiscount = async (code: string): Promise<boolean> => {
    if (!code.trim()) {
      setDiscountMessage('Please enter a coupon code.');
      return false;
    }

    const res = await StoreService.validateDiscount(code, subtotal);
    setDiscountMessage(res.message);
    if (res.valid && res.discount) {
      setDiscountCode(code.toUpperCase().trim());
      setDiscountAmount(res.discountAmount);
      setAppliedDiscount(res.discount);
      return true;
    } else {
      setDiscountAmount(0);
      setAppliedDiscount(null);
      return false;
    }
  };

  const removeDiscount = () => {
    setDiscountCode('');
    setDiscountAmount(0);
    setAppliedDiscount(null);
    setDiscountMessage('');
  };

  // Re-evaluate discount amount when subtotal changes
  useEffect(() => {
    if (appliedDiscount) {
      let amount = 0;
      if (appliedDiscount.discount_type === 'percentage') {
        amount = Math.round((subtotal * appliedDiscount.value) / 100);
        if (appliedDiscount.max_discount_amount && amount > appliedDiscount.max_discount_amount) {
          amount = appliedDiscount.max_discount_amount;
        }
      } else {
        amount = appliedDiscount.value;
      }
      setDiscountAmount(Math.min(amount, subtotal));
    }
  }, [subtotal, appliedDiscount]);

  const total = Math.max(0, subtotal - discountAmount + shippingFee);

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        subtotal,
        shippingFee,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        freeShippingRemaining,
        discountCode,
        discountAmount,
        appliedDiscount,
        discountMessage,
        applyDiscount,
        removeDiscount,
        total,
        isCartOpen,
        setIsCartOpen,
        wishlist,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

