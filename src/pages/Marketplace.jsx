import React, { useEffect, useState } from 'react';
import {
  ShoppingBag,
  Search,
  Plus,
  Sparkles,
  Image as ImageIcon,
  X,
  Loader2,
  MapPin,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import ProductCard from '../components/ProductCard';

export default function Marketplace() {
  const [productsList, setProductsList] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // FORM STATE
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('UI Kits');
  const [condition, setCondition] = useState('Used');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const categories = [
    'all',
    'UI Kits',
    'Presets',
    '3D Models',
    'Guides',
    'Other',
  ];

  useEffect(() => {
    initializeMarketplace();
  }, []);

  const initializeMarketplace = async () => {
    try {
      setLoading(true);
      setError('');

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        setError('Please login to use Marketplace.');
        setLoading(false);
        return;
      }

      setCurrentUser(user);
      await loadProducts();
    } catch (err) {
      console.error('Marketplace initialization error:', err);
      setError(err.message || 'Could not initialize Marketplace.');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select(`
          *,
          profiles (
            id,
            full_name,
            username,
            profile_image
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedProducts = (data || []).map((item) => ({
        id: item.id,
        title: item.title || 'Untitled Product',
        price: Number(item.price) || 0,
        category: item.category || 'Other',
        condition: item.condition || 'Used',
        description: item.description || '',
        location: item.location || '',
        image_url: item.image_url || '',
        seller_id: item.seller_id,
        seller: item.profiles?.full_name || item.profiles?.username || 'User',
        seller_username: item.profiles?.username || '',
        seller_avatar: item.profiles?.profile_image || '',
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));

      setProductsList(formattedProducts);
    } catch (err) {
      console.error('Load marketplace products error:', err);
      setError(err.message || 'Could not load marketplace products.');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB.');
      e.target.value = '';
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      e.target.value = '';
      return;
    }

    setError('');
    setImageFile(file);

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const uploadProductImage = async (userId) => {
    if (!imageFile) return '';

    const fileExt = imageFile.name.split('.').pop().toLowerCase();
    const filePath = `${userId}/product-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('marketplace-images')
      .upload(filePath, imageFile, { cacheControl: '3600', upsert: false });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('marketplace-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const onSubmitNewProduct = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      setError('You must be logged in to create a listing.');
      return;
    }

    if (!title.trim()) {
      setError('Please enter a product title.');
      return;
    }

    if (!price || Number(price) < 0) {
      setError('Please enter a valid price.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      let imageUrl = '';
      if (imageFile) {
        imageUrl = await uploadProductImage(currentUser.id);
      }

      const { data, error } = await supabase
        .from('marketplace_listings')
        .insert({
          seller_id: currentUser.id,
          title: title.trim(),
          description: description.trim(),
          price: Number(price),
          category,
          condition,
          location: location.trim(),
          image_url: imageUrl,
          status: 'active',
        })
        .select(`
          *,
          profiles (
            id,
            full_name,
            username,
            profile_image
          )
        `)
        .single();

      if (error) throw error;

      const newProduct = {
        id: data.id,
        title: data.title,
        price: Number(data.price),
        category: data.category,
        condition: data.condition,
        description: data.description || '',
        location: data.location || '',
        image_url: data.image_url || '',
        seller_id: data.seller_id,
        seller: data.profiles?.full_name || data.profiles?.username || 'User',
        seller_username: data.profiles?.username || '',
        seller_avatar: data.profiles?.profile_image || '',
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      setProductsList((prev) => [newProduct, ...prev]);
      resetForm();
      setShowCreateModal(false);
      setSuccess('Your listing was posted successfully!');
    } catch (err) {
      console.error('Create marketplace listing error:', err);
      setError(err.message || 'Could not create listing.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setPrice('');
    setCategory('UI Kits');
    setCondition('Used');
    setDescription('');
    setLocation('');
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview('');
  };

  const handleDeleteProduct = async (productId) => {
    if (!currentUser) {
      setError('You must be logged in.');
      return;
    }

    try {
      setError('');
      setSuccess('');

      const { error } = await supabase
        .from('marketplace_listings')
        .delete()
        .eq('id', productId)
        .eq('seller_id', currentUser.id);

      if (error) throw error;

      setProductsList((prev) => prev.filter((p) => p.id !== productId));
      setSuccess('Listing deleted successfully.');
    } catch (err) {
      console.error('Delete listing error:', err);
      setError(err.message || 'Could not delete listing.');
    }
  };

  const filteredProducts = productsList.filter((product) => {
    const search = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !search ||
      product.title.toLowerCase().includes(search) ||
      product.description.toLowerCase().includes(search) ||
      product.category.toLowerCase().includes(search) ||
      product.location.toLowerCase().includes(search);

    if (activeCategory === 'all') return matchesSearch;
    return matchesSearch && product.category === activeCategory;
  });

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-xs sm:text-sm text-slate-400 font-bold uppercase tracking-wider">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-12 space-y-8">

      {/* Success/Error Toast Message Block */}
      <AnimatePresence>
        {(error || success) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`p-4 rounded-2xl border text-xs sm:text-sm font-bold ${
              success
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                : 'bg-red-500/10 border-red-500/20 text-red-500'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <span>{success || error}</span>
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setSuccess('');
                }}
                className="opacity-70 hover:opacity-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Gradient Hero Panel */}
      <div className="p-8 rounded-[32px] bg-gradient-to-tr from-[#121626] via-[#1E193C] to-[#121626] text-white shadow-xl relative overflow-hidden border border-indigo-500/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 max-w-xl">
          <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-[9px] font-extrabold uppercase tracking-widest mb-3 inline-block">
            Nexus Creator Shop
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-['Outfit'] mb-2.5 tracking-tight leading-tight">
            Creator Digital Assets Store
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
            Buy and sell professional-tier design tokens, UI kits, high-fidelity photography presets, and 3D models direct from your favorite network creators.
          </p>
        </div>

        <motion.button
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={() => {
            setError('');
            setSuccess('');
            setShowCreateModal(true);
          }}
          className="relative z-10 px-5.5 py-3 bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-pink-500/20 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>List Digital Asset</span>
        </motion.button>
      </div>

      {/* Filter and Search Bar Row */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 glass-card p-4 rounded-3xl bg-white dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 shadow-sm">
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto no-scrollbar py-1">
          {categories.map((cat) => (
            <button
              type="button"
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize shrink-0 transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/10'
                  : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat === 'all' ? 'All Products' : cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800/60 border border-slate-200/40 dark:border-slate-700/40 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="min-h-[200px]">
        {filteredProducts.length === 0 ? (
          <div className="glass-card rounded-3xl p-16 text-center border border-slate-200/50 dark:border-slate-800/40 bg-white dark:bg-slate-900/40">
            <ShoppingBag className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm uppercase tracking-wider">No assets available</h3>
            <p className="text-xs text-slate-400 mt-1">Be the first creative designer to list something on the store.</p>
            <motion.button
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={() => {
                setError('');
                setSuccess('');
                setShowCreateModal(true);
              }}
              className="mt-6 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>List Product</span>
            </motion.button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                currentUser={currentUser}
                onDelete={handleDeleteProduct}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Listing Modal with AnimatePresence */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                resetForm();
                setShowCreateModal(false);
              }}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
            />

            {/* Scrollable Modal Content Frame */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              className="w-full max-w-md max-h-[90vh] overflow-y-auto glass-card bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200/50 dark:border-slate-800/40 relative z-10 no-scrollbar"
            >
              <div className="flex items-start justify-between mb-4.5">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2 font-['Outfit']">
                    <Sparkles className="w-5 h-5 text-indigo-500" />
                    <span>List Digital Asset</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                    Create a real marketplace listing
                  </p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowCreateModal(false);
                  }}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                >
                  <X className="w-4.5 h-4.5" />
                </motion.button>
              </div>

              <form onSubmit={onSubmitNewProduct} className="space-y-4">
                
                {/* Visual Cover Select block */}
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Product Asset Cover</label>
                  <label className="block cursor-pointer">
                    <div className="w-full h-44 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-colors flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-950/40">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Product Cover Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center p-4">
                          <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-1.5" />
                          <p className="text-xs font-bold text-slate-500">Tap to upload high-res image</p>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">JPG, PNG, WEBP • Max 5MB</p>
                        </div>
                      )}
                    </div>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                </div>

                {/* Title Input */}
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Asset Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Neon Cyberpunk UI Kits"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200/40 dark:border-slate-700/40 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    required
                  />
                </div>

                {/* Price & Category Fields */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Price (USD)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="25"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200/40 dark:border-slate-700/40 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-extrabold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200/40 dark:border-slate-700/40 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                    >
                      <option value="UI Kits">UI Kits</option>
                      <option value="Presets">Presets</option>
                      <option value="3D Models">3D Models</option>
                      <option value="Guides">Guides</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Condition selection */}
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Product Status</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200/40 dark:border-slate-700/40 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  >
                    <option value="New">New Asset</option>
                    <option value="Like New">Like New</option>
                    <option value="Used">Used</option>
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Creator Location</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="e.g. San Francisco, CA"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200/40 dark:border-slate-700/40 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Description</label>
                  <textarea
                    rows="3"
                    placeholder="Describe your design patterns or asset components..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200/40 dark:border-slate-700/40 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium resize-none"
                  />
                </div>

                {/* Buttons block */}
                <div className="flex gap-2.5 pt-2">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    type="button"
                    onClick={() => {
                      resetForm();
                      setShowCreateModal(false);
                    }}
                    disabled={submitting}
                    className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-md shadow-indigo-500/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Posting...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>List Asset</span>
                      </>
                    )}
                  </motion.button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
