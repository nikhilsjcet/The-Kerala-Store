import React, { useState, useEffect, useRef } from 'react';
import { Product, Category, Supplier } from '../../types';
import { INITIAL_CATEGORIES } from '../../services/seedData';
import { X, Upload, Plus, Trash2, ShieldAlert, Image as ImageIcon } from 'lucide-react';

interface ProductModalProps {
  isOpen: boolean;
  product?: Product | null;
  categories: Category[];
  suppliers: Supplier[];
  onClose: () => void;
  onSave: (product: Partial<Product>) => Promise<void>;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  product,
  categories: propCategories,
  suppliers,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const categories = propCategories && propCategories.length > 0 ? propCategories : INITIAL_CATEGORIES;

  const [formData, setFormData] = useState<Partial<Product>>({
    title: '',
    slug: '',
    short_description: '',
    description: '',
    images: [],
    price: 0,
    original_price: undefined,
    delivery_charge: 0,
    category_id: categories[0]?.id || '',
    sku: '',
    stock_quantity: 10,
    is_featured: false,
    is_trending: false,
    is_new_arrival: false,
    is_on_sale: false,
    status: 'published',
    supplier_name: '',
    supplier_cost: undefined,
    supplier_url: '',
    supplier_sku: '',
    processing_time_days: 2,
    variants: [],
  });

  const [newImageUrl, setNewImageUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Technical Specifications (Key & Value pairs)
  const [specsList, setSpecsList] = useState<{ key: string; value: string }[]>([]);

  const handleDeviceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setFormData((prev) => ({
            ...prev,
            images: [...(prev.images || []), result],
          }));
        }
      };
      reader.readAsDataURL(file);
    });

    if (e.target) e.target.value = '';
  };

  useEffect(() => {
    if (product) {
      setFormData({ ...product });
      const specs = product.specifications || {};
      const pairs = Object.entries(specs).map(([key, value]) => ({ key, value: String(value) }));
      setSpecsList(pairs.length > 0 ? pairs : [
        { key: 'Brand', value: 'The Kerala Store' },
        { key: 'Material', value: '' },
        { key: 'Warranty', value: '7 Days Replacement' },
        { key: 'Origin', value: 'Kerala, India' },
      ]);
    } else {
      setFormData({
        title: '',
        slug: '',
        short_description: '',
        description: '',
        images: [],
        price: 0,
        original_price: undefined,
        delivery_charge: 0,
        category_id: categories[0]?.id || '',
        sku: '',
        stock_quantity: 10,
        is_featured: false,
        is_trending: false,
        is_new_arrival: false,
        is_on_sale: false,
        status: 'published',
        supplier_name: '',
        supplier_cost: undefined,
        supplier_url: '',
        supplier_sku: '',
        processing_time_days: 2,
        variants: [],
      });
      setSpecsList([
        { key: 'Brand', value: 'The Kerala Store' },
        { key: 'Material', value: '' },
        { key: 'Warranty', value: '7 Days Replacement' },
        { key: 'Origin', value: 'Kerala, India' },
      ]);
    }
  }, [product, categories, suppliers]);

  const handleAddSpec = (key = '', value = '') => {
    setSpecsList((prev) => [...prev, { key, value }]);
  };

  const handleUpdateSpec = (index: number, field: 'key' | 'value', val: string) => {
    setSpecsList((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleRemoveSpec = (index: number) => {
    setSpecsList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), newImageUrl.trim()],
      }));
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const specsRecord: Record<string, string> = {};
      specsList.forEach((s) => {
        if (s.key.trim() && s.value.trim()) {
          specsRecord[s.key.trim()] = s.value.trim();
        }
      });

      const dataToSave = {
        ...formData,
        specifications: specsRecord,
        category_id: formData.category_id || categories[0]?.id,
        slug: formData.slug?.trim() || (formData.title || 'prod').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        status: formData.status || 'published',
      };
      await onSave(dataToSave);
      setIsSaving(false);
      onClose();
    } catch (err) {
      console.error(err);
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative border border-gray-100 max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {product ? 'Edit Product' : 'Add New Dropship Product'}
            </h3>
            <p className="text-xs text-gray-500">
              Changes reflect instantly on live storefront via Supabase
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="mt-4 flex-1 overflow-y-auto space-y-6 pr-2">
          
          {/* Section: General Info */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0A5C36]">
              Storefront Details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. UltraGlide 4K Drone"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A5C36]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">URL Slug</label>
                <input
                  type="text"
                  name="slug"
                  placeholder="auto-generated-if-empty"
                  value={formData.slug}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A5C36]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Selling Price (INR) *</label>
                <input
                  type="number"
                  name="price"
                  required
                  min={1}
                  placeholder="e.g. 499"
                  value={formData.price || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A5C36] font-semibold text-[#0A5C36]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Original Price (INR)</label>
                <input
                  type="number"
                  name="original_price"
                  placeholder="e.g. 999"
                  value={formData.original_price || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A5C36]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Delivery Charge (INR)</label>
                <input
                  type="number"
                  name="delivery_charge"
                  min={0}
                  placeholder="0 for Free Delivery"
                  value={formData.delivery_charge ?? 0}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A5C36] font-medium"
                />
                <span className="text-[10px] text-gray-400">0 = Free Doorstep Delivery</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Department / Category</label>
                <select
                  name="category_id"
                  value={formData.category_id || categories[0]?.id || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A5C36]"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Short Tagline Description</label>
              <input
                type="text"
                name="short_description"
                placeholder="Brief high-impact product overview..."
                value={formData.short_description}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A5C36]"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-gray-900 mb-1">Full Description</label>
              <textarea
                name="description"
                rows={4}
                placeholder="Write full product overview, highlights, craft story, and usage details..."
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#0A5C36] leading-relaxed"
              />
            </div>

            {/* Technical Specifications Section */}
            <div className="p-4 bg-stone-50 border-2 border-gray-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-900">
                    Technical Specifications
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    Shown in the Technical Specifications tab on the live product page
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleAddSpec('', '')}
                  className="px-3 py-1.5 bg-[#0A5C36] hover:bg-[#064024] text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Spec
                </button>
              </div>

              {/* Quick Add Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Quick Add:</span>
                {['Brand', 'Material', 'Warranty', 'Dimensions', 'Origin', 'Battery', 'Weight', 'Color'].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => {
                      if (!specsList.some((s) => s.key.toLowerCase() === chip.toLowerCase())) {
                        handleAddSpec(chip, '');
                      }
                    }}
                    className="text-[11px] font-bold bg-white hover:bg-emerald-50 text-gray-700 hover:text-[#0A5C36] px-2.5 py-1 rounded-lg border border-gray-200 hover:border-emerald-300 transition-colors cursor-pointer"
                  >
                    + {chip}
                  </button>
                ))}
              </div>

              {/* Specs Rows */}
              <div className="space-y-2 pt-2">
                {specsList.map((spec, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Spec Name (e.g. Battery)"
                      value={spec.key}
                      onChange={(e) => handleUpdateSpec(idx, 'key', e.target.value)}
                      className="w-1/3 px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl font-bold text-gray-800 focus:outline-none focus:border-[#0A5C36]"
                    />
                    <input
                      type="text"
                      placeholder="Value (e.g. 5000 mAh / 100% Cotton)"
                      value={spec.value}
                      onChange={(e) => handleUpdateSpec(idx, 'value', e.target.value)}
                      className="flex-1 px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-[#0A5C36]"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSpec(idx)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors cursor-pointer rounded-lg hover:bg-red-50"
                      title="Remove specification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section: Images */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0A5C36]">
                Product Images
              </h4>
              <span className="text-[11px] text-gray-400">
                {(formData.images || []).length} attached
              </span>
            </div>

            {/* Upload from Device or Paste Link */}
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleDeviceUpload}
                accept="image/*"
                multiple
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#0A5C36] border border-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
                title="Attach photo directly from your phone, tablet, or PC"
              >
                <Upload className="w-4 h-4 text-emerald-700" />
                <span>Upload from Device</span>
              </button>

              <div className="flex gap-2 flex-1">
                <input
                  type="url"
                  placeholder="Or paste image URL (https://...)"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A5C36]"
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="px-3.5 py-2 bg-gray-800 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0"
                >
                  Add Link
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {(formData.images || []).map((img, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-xl border border-gray-200 p-1 bg-stone-50 group">
                  <img src={img} alt="" className="w-full h-full object-contain" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute -top-1.5 -right-1.5 bg-red-600 text-white p-1 rounded-full shadow-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Dropshipping Private Fields (Never exposed to customers) */}
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-4">
            <div className="flex items-center space-x-2 text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-700" />
              <h4 className="text-xs font-extrabold uppercase tracking-wider">
                Private Dropshipping Information (Admin Only)
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Supplier Name</label>
                <input
                  type="text"
                  name="supplier_name"
                  placeholder="e.g. Shenzhen Apex"
                  value={formData.supplier_name || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs bg-white border border-amber-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Wholesale Supplier Cost (₹)</label>
                <input
                  type="number"
                  name="supplier_cost"
                  placeholder="Cost price in INR"
                  value={formData.supplier_cost || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs bg-white border border-amber-200 rounded-xl font-bold text-amber-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Processing Time (Days)</label>
                <input
                  type="number"
                  name="processing_time_days"
                  value={formData.processing_time_days || 2}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs bg-white border border-amber-200 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Private Supplier Order URL</label>
                <input
                  type="url"
                  name="supplier_url"
                  placeholder="https://supplier-portal.com/item/..."
                  value={formData.supplier_url || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs bg-white border border-amber-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Supplier SKU / Ref Code</label>
                <input
                  type="text"
                  name="supplier_sku"
                  placeholder="e.g. SZ-APX-492"
                  value={formData.supplier_sku || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs bg-white border border-amber-200 rounded-xl font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section: Status & Display Flags */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <label className="flex items-center space-x-2 text-xs font-medium text-gray-800">
              <input
                type="checkbox"
                name="is_featured"
                checked={formData.is_featured}
                onChange={handleChange}
                className="accent-[#0A5C36]"
              />
              <span>Featured Hero</span>
            </label>

            <label className="flex items-center space-x-2 text-xs font-medium text-gray-800">
              <input
                type="checkbox"
                name="is_trending"
                checked={formData.is_trending}
                onChange={handleChange}
                className="accent-[#0A5C36]"
              />
              <span>Trending Pick</span>
            </label>

            <label className="flex items-center space-x-2 text-xs font-medium text-gray-800">
              <input
                type="checkbox"
                name="is_new_arrival"
                checked={formData.is_new_arrival}
                onChange={handleChange}
                className="accent-[#0A5C36]"
              />
              <span>New Arrival</span>
            </label>

            <div>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-2 py-1 text-xs font-bold bg-gray-100 border border-gray-300 rounded-lg text-gray-800"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-[#0A5C36] hover:bg-[#064024] disabled:opacity-50 text-white rounded-2xl text-xs font-bold transition-all shadow-sm"
            >
              {isSaving ? 'Saving Product...' : 'Publish / Save Product'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

