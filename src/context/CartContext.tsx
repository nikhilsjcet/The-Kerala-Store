import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { CartItem, Product, ProductVariant, DiscountCode } from '../types';
import { StoreService } from '../services/storeService';
import { useAuth } from './AuthContext';

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

const FREE_SHIPPING_THRESHOLD = 999;
const STANDARD_SHIPPING_FEE = 99;

const getCartStorageKey = (userId?: string | null) => 
  userId ? `thekeralastore_cart_user_${userId}` : 'thekeralastore_cart_guest';

const getWishlistStorageKey = (userId?: string | null) => 
  userId ? `thekeralastore_wishlist_user_${userId}` : 'thekeralastore_wishlist_guest';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const currentUserIdRef = useRef<string | null>(user?.id || null);

  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const key = getCartStorageKey(user?.id);
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed: CartItem[] = JSON.parse(saved);
        // Sanitize: filter out any unlisted or draft products
        return parsed.filter((it) => !it.product?.status || it.product.status === 'published');
      }
      return [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const key = getWishlistStorageKey(user?.id);
      const saved = localStorage.getItem(key);
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

  // Handle User change (Login, Logout, Account Switch) -> Isolate carts per account
  useEffect(() => {
    const prevUserId = currentUserIdRef.current;
    const nextUserId = user?.id || null;

    if (prevUserId !== nextUserId) {
      currentUserIdRef.current = nextUserId;

      // When switching accounts or logging out, clear previous cart from state
      // and load the new user's isolated cart
      const key = getCartStorageKey(nextUserId);
      const savedCart = localStorage.getItem(key);
      if (savedCart) {
        try {
          const parsed: CartItem[] = JSON.parse(savedCart);
          setCart(parsed.filter((it) => !it.product?.status || it.product.status === 'published'));
        } catch {
          setCart([]);
        }
      } else {
        setCart([]);
      }

      const wishlistKey = getWishlistStorageKey(nextUserId);
      const savedWishlist = localStorage.getItem(wishlistKey);
      if (savedWishlist) {
        try {
          setWishlist(JSON.parse(savedWishlist));
        } catch {
          setWishlist([]);
        }
      } else {
        setWishlist([]);
      }

      setDiscountCode('');
      setDiscountAmount(0);
      setAppliedDiscount(null);
      setDiscountMessage('');
    }
  }, [user]);

  // Persist cart per current user key
  useEffect(() => {
    try {
      const key = getCartStorageKey(user?.id);
      localStorage.setItem(key, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart:', e);
    }
  }, [cart, user?.id]);

  // Persist wishlist per current user key
  useEffect(() => {
    try {
      const key = getWishlistStorageKey(user?.id);
      localStorage.setItem(key, JSON.stringify(wishlist));
    } catch (e) {
      console.error('Failed to save wishlist:', e);
    }
  }, [wishlist, user?.id]);

  const addToCart = (product: Product, quantity = 1, variant?: ProductVariant) => {
    // Only published and in-stock products can be added to the customer cart
    if (product.status && product.status !== 'published') {
      alert(`"${product.title}" is currently unlisted.`);
      return;
    }

    if (typeof product.stock_quantity === 'number' && product.stock_quantity <= 0) {
      alert(`"${product.title}" is currently out of stock.`);
      return;
    }

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
    try {
      const key = getCartStorageKey(user?.id);
      localStorage.removeItem(key);
    } catch (e) {
      console.error(e);
    }
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
