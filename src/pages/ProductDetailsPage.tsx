import React, { useState, useEffect } from 'react';
import { Product, ProductVariant } from '../types';
import { StoreService } from '../services/storeService';
import { formatINR } from '../lib/utils';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ProductCard } from '../components/storefront/ProductCard';
import { 
  Star, 
  ShoppingBag, 
  Zap, 
  Heart, 
  Truck, 
  RotateCcw, 
  ShieldCheck, 
  Check, 
  Plus, 
  Minus, 
  MapPin, 
  Share2,
  ChevronRight,
  Info
} from 'lucide-react';

interface ProductDetailsPageProps {
  slug: string;
  onNavigate: (page: string, param?: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({
  slug,
  onNavigate,
  onSelectProduct,
}) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState('');
  const [pincodeMessage, setPincodeMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');
  const [copiedShare, setCopiedShare] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { addToCart, isInWishlist, toggleWishlist, setIsCartOpen } = useCart();
  const { user, openAuthModal } = useAuth();

  // Ensure scroll is at the very top immediately when entering product details
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (typeof document !== 'undefined') {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, [slug]);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const loadProduct = async () => {
      try {
        const prod = await StoreService.getProductBySlug(slug);
        if (isMounted && prod) {
          setProduct(prod);
          setSelectedImage(prod.images[0] || '');
          setSelectedVariant(prod.variants?.[0]);
          setQuantity(1);

          // Fetch related
          const related = await StoreService.getProducts({
            category_id: prod.category_id,
            limit: 4,
          });
          setRelatedProducts(related.filter((p) => p.id !== prod.id));
          setIsLoading(false);

          // Scroll to top when product finishes loading
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }
      } catch (e) {
        console.error(e);
        if (isMounted) setIsLoading(false);
      }
    };

    loadProduct();
    return () => { isMounted = false; };
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-[#FBFBFA]">
        <div className="w-12 h-12 rounded-full border-4 border-[#0A5C36] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#FBFBFA] text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Product Not Found</h2>
        <p className="text-sm text-gray-500 mb-6">This item might have been archived or removed from the catalog.</p>
        <button
          onClick={() => onNavigate('shop')}
          className="px-6 py-2.5 bg-[#0A5C36] text-white rounded-full font-bold text-xs"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const activePrice = selectedVariant?.price || product.price;
  const activeOriginalPrice = selectedVariant?.original_price || product.original_price;
  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedVariant);
  };

  const handleBuyNow = () => {
    if (!user) {
      openAuthModal();
      return;
    }
    addToCart(product, quantity, selectedVariant);
    onNavigate('checkout');
  };

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = pincode.trim();
    if (!/^\d{6}$/.test(clean)) {
      setPincodeMessage('⚠️ Please enter a valid 6-digit Indian PIN code.');
      return;
    }

    // Live delivery region analysis for Indian pin codes
    const prefix = clean.substring(0, 2);
    let region = 'Pan-India Delivery';
    let days = 4;

    if (prefix === '67' || prefix === '68' || prefix === '69') {
      region = 'Kerala (Express Local Courier)';
      days = 2; // Fast 2-day delivery across Kerala
    } else if (clean.startsWith('5')) {
      region = 'South India (Karnataka, Tamil Nadu, Andhra)';
      days = 3;
    } else if (clean.startsWith('4') || clean.startsWith('3')) {
      region = 'Western India (Maharashtra, Gujarat)';
      days = 4;
    } else {
      region = 'North & East India';
      days = 4;
    }

    const targetDate = new Date(Date.now() + 86400000 * days);
    const dateFormatted = targetDate.toLocaleDateString('en-IN', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });

    setPincodeMessage(
      `✅ Delivery available to PIN ${clean} (${region}) by ${dateFormatted}.\n🚚 Free Doorstep Delivery • 💵 Cash on Delivery Available • 📦 Direct Dispatch from Supplier Warehouse`
    );
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-xs text-gray-500 mb-6">
          <button onClick={() => onNavigate('home')} className="hover:text-gray-900">Home</button>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <button onClick={() => onNavigate('shop')} className="hover:text-gray-900">Shop</button>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <button 
            onClick={() => onNavigate('shop', `category=${product.category?.slug}`)} 
            className="hover:text-gray-900 capitalize"
          >
            {product.category?.name || 'Department'}
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-800 font-semibold truncate max-w-[200px] sm:max-w-xs">{product.title}</span>
        </nav>

        {/* Main Product Showcase Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 bg-white p-6 sm:p-10 rounded-3xl border border-gray-200/80 shadow-2xs">
          
          {/* Left Column: Image Gallery */}
          <div className="flex flex-col-reverse sm:flex-row gap-4">
            
            {/* Thumbnail Column */}
            {product.images.length > 1 && (
              <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto sm:max-h-[500px] pb-2 sm:pb-0">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 p-1 bg-stone-50 transition-all shrink-0 ${
                      selectedImage === img ? 'border-[#0A5C36] shadow-sm' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}

            {/* Main Stage Image */}
            <div className="flex-1 aspect-square bg-stone-50 rounded-2xl border border-gray-100 flex items-center justify-center p-6 relative overflow-hidden group">
              <img
                src={selectedImage}
                alt={product.title}
                className="w-full h-full object-contain object-center transform group-hover:scale-108 transition-transform duration-300"
              />

              {/* Discount Badge */}
              {product.discount_percentage ? (
                <div className="absolute top-4 left-4 bg-[#FF3B80] text-white font-extrabold text-xs px-2.5 py-1 rounded-full shadow-sm">
                  {product.discount_percentage}% OFF
                </div>
              ) : null}

              {/* Share and Wishlist Buttons */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={handleShare}
                  className="p-2.5 bg-white/90 rounded-full shadow-sm text-gray-600 hover:text-gray-900 hover:bg-white transition-colors"
                  title="Share product link"
                >
                  {copiedShare ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-2.5 rounded-full shadow-sm transition-colors ${
                    isWishlisted ? 'bg-pink-50 text-[#FF3B80]' : 'bg-white/90 text-gray-600 hover:text-[#FF3B80] hover:bg-white'
                  }`}
                  title="Save to Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#FF3B80]' : ''}`} />
                </button>
              </div>
            </div>

          </div>

          {/* Right Column: Information, Pricing, Variants, Actions */}
          <div className="flex flex-col justify-between">
            <div>
              {/* Category & SKU */}
              <div className="flex items-center justify-between text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">
                <span>{product.category?.name || 'Department'}</span>
                <span>SKU: {product.sku}</span>
              </div>

              {/* Product Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-snug mb-3">
                {product.title}
              </h1>

              {/* Delivery info & Verified badge */}
              <div className="flex items-center space-x-3 mb-4 flex-wrap gap-y-2">
                <span className="text-xs text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-[#0A5C36]" />
                  {product.delivery_charge && product.delivery_charge > 0 
                    ? `Delivery: ₹${product.delivery_charge}` 
                    : 'Free Doorstep Delivery'}
                </span>
                {product.customer_reviews && product.customer_reviews.length > 0 ? (
                  <div className="flex items-center gap-1.5 text-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-gray-800">{product.rating.toFixed(1)}</span>
                    <span className="text-gray-400">({product.customer_reviews.length} reviews)</span>
                  </div>
                ) : (
                  <span className="text-[11px] text-gray-400">New Verified Product</span>
                )}
              </div>

              {/* Price Banner in INR */}
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/60 mb-6">
                <div className="flex items-baseline space-x-3">
                  <span className="text-3xl sm:text-4xl font-black text-[#0A5C36]">
                    {formatINR(activePrice)}
                  </span>
                  {activeOriginalPrice && activeOriginalPrice > activePrice && (
                    <span className="text-base text-gray-400 line-through">
                      {formatINR(activeOriginalPrice)}
                    </span>
                  )}
                  {product.discount_percentage && (
                    <span className="text-xs font-bold text-[#FF3B80] bg-pink-100 px-2 py-0.5 rounded-full">
                      Save {product.discount_percentage}%
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Inclusive of all taxes &amp; door delivery fees across India.
                </p>
              </div>

              {/* Short Description */}
              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                {product.short_description}
              </p>

              {/* Variants Selector */}
              {product.variants && product.variants.length > 0 && (
                <div className="mb-6 space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                    Select Option / Edition:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                          selectedVariant?.id === v.id
                            ? 'bg-[#0A5C36] text-white border-[#0A5C36] shadow-xs'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {v.name}
                        {v.price && v.price !== product.price ? ` (${formatINR(v.price)})` : ''}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector & Stock Status */}
              <div className="flex items-center space-x-4 mb-6">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Quantity
                  </label>
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 px-3 text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-sm font-bold text-gray-900">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 px-3 text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="self-end pb-1">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                    <Check className="w-3.5 h-3.5" /> In Stock &amp; Ready to Ship
                  </span>
                </div>
              </div>

              {/* Action Buttons: Add to Cart and Buy Now */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                <button
                  onClick={handleAddToCart}
                  className="py-3.5 px-6 rounded-2xl bg-[#0A5C36] hover:bg-[#064024] active:scale-98 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition-all"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  className="py-3.5 px-6 rounded-2xl bg-[#1D4ED8] hover:bg-[#1E40AF] active:scale-98 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition-all"
                >
                  <Zap className="w-4 h-4" />
                  <span>Buy Now</span>
                </button>
              </div>

              {/* Indian Pincode Delivery Estimator */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 mb-6">
                <form onSubmit={handleCheckPincode} className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Enter 6-digit PIN code (e.g. 682042)"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#0A5C36]"
                    />
                    <MapPin className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors"
                  >
                    Check Delivery
                  </button>
                </form>
                {pincodeMessage && (
                  <p className="mt-2 text-xs font-medium text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                    {pincodeMessage}
                  </p>
                )}
              </div>

              {/* Trust Features */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100 text-center">
                <div className="flex flex-col items-center">
                  <Truck className="w-5 h-5 text-[#0A5C36] mb-1" />
                  <span className="text-[11px] font-bold text-gray-800">Free Express</span>
                  <span className="text-[10px] text-gray-400">On ₹999+</span>
                </div>
                <div className="flex flex-col items-center">
                  <RotateCcw className="w-5 h-5 text-amber-600 mb-1" />
                  <span className="text-[11px] font-bold text-gray-800">7 Days Return</span>
                  <span className="text-[10px] text-gray-400">Easy replacement</span>
                </div>
                <div className="flex flex-col items-center">
                  <ShieldCheck className="w-5 h-5 text-blue-600 mb-1" />
                  <span className="text-[11px] font-bold text-gray-800">100% Secure</span>
                  <span className="text-[10px] text-gray-400">COD &amp; Razorpay</span>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Detailed Tabs: Description, Specifications, Reviews */}
        <div className="mt-12 bg-white rounded-3xl p-6 sm:p-10 border-2 border-gray-200 shadow-sm">
          <div className="flex border-b-2 border-gray-200 text-sm font-bold gap-6">
            <button
              onClick={() => setActiveTab('desc')}
              className={`pb-3 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'desc' ? 'border-[#0A5C36] text-[#0A5C36] font-black' : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`pb-3 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'specs' ? 'border-[#0A5C36] text-[#0A5C36] font-black' : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              Technical Specifications
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-3 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'reviews' ? 'border-[#0A5C36] text-[#0A5C36] font-black' : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              Customer Reviews ({product.customer_reviews?.length || 0})
            </button>
          </div>

          <div className="py-6">
            {activeTab === 'desc' && (
              <div className="space-y-4 text-sm text-gray-800 leading-relaxed font-medium">
                <p className="whitespace-pre-line">{product.description}</p>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="overflow-x-auto">
                {Object.keys(product.specifications || {}).length === 0 ? (
                  <div className="text-center py-8 text-xs text-gray-500 font-semibold bg-stone-50 rounded-2xl border-2 border-dashed border-gray-200">
                    No technical specifications added yet.
                  </div>
                ) : (
                  <div className="border-2 border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <tbody>
                        {Object.entries(product.specifications || {}).map(([key, val], idx) => (
                          <tr key={key} className={idx % 2 === 0 ? 'bg-stone-50/80 border-b border-gray-200' : 'bg-white border-b border-gray-200 last:border-b-0'}>
                            <td className="py-3.5 px-4 font-black text-gray-900 w-1/3 sm:w-1/4 border-r border-gray-200">{key}</td>
                            <td className="py-3.5 px-4 text-gray-800 font-medium">{val}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {product.customer_reviews && product.customer_reviews.length > 0 ? (
                  product.customer_reviews.map((rev) => (
                    <div key={rev.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100/80">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-gray-800">{rev.author}</p>
                            {rev.verified_purchase && (
                              <span className="text-[10px] bg-emerald-100 text-[#0A5C36] font-bold px-2 py-0.5 rounded-full">
                                Verified Buyer
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-400">{rev.location} {rev.date ? `• ${rev.date}` : ''}</p>
                        </div>
                        <div className="flex text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                        {rev.comment}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-sm font-semibold text-gray-700">No customer reviews yet</p>
                    <p className="text-xs text-gray-400 mt-1">Verified customers will be invited to leave an honest review after delivery.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products Grid */}
        {relatedProducts.length > 0 && (
          <div className="mt-14">
            <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight mb-6">
              You Might Also Like
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} onSelect={onSelectProduct} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

