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

import { supabase } from '../lib/supabaseClient';
import ProductCard from '../components/ProductCard';

export default function Marketplace() {
  // =====================================================
  // STATE
  // =====================================================

  const [productsList, setProductsList] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // =====================================================
  // FORM STATE
  // =====================================================

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('UI Kits');
  const [condition, setCondition] = useState('Used');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // =====================================================
  // CATEGORIES
  // =====================================================

  const categories = [
    'all',
    'UI Kits',
    'Presets',
    '3D Models',
    'Guides',
    'Other',
  ];

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    initializeMarketplace();
  }, []);

  // =====================================================
  // INITIALIZE MARKETPLACE
  // =====================================================

  const initializeMarketplace = async () => {
    try {
      setLoading(true);
      setError('');

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        setError('Please login to use Marketplace.');
        setLoading(false);
        return;
      }

      setCurrentUser(user);

      await loadProducts();
    } catch (err) {
      console.error(
        'Marketplace initialization error:',
        err
      );

      setError(
        err.message ||
          'Could not initialize Marketplace.'
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD PRODUCTS
  // =====================================================

  const loadProducts = async () => {
    try {
      const {
        data,
        error,
      } = await supabase
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
        .order('created_at', {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      const formattedProducts =
        (data || []).map((item) => ({
          id: item.id,

          title:
            item.title || 'Untitled Product',

          price:
            Number(item.price) || 0,

          category:
            item.category || 'Other',

          condition:
            item.condition || 'Used',

          description:
            item.description || '',

          location:
            item.location || '',

          image_url:
            item.image_url || '',

          seller_id:
            item.seller_id,

          seller:
            item.profiles?.full_name ||
            item.profiles?.username ||
            'User',

          seller_username:
            item.profiles?.username || '',

          seller_avatar:
            item.profiles?.profile_image || '',

          created_at:
            item.created_at,

          updated_at:
            item.updated_at,
        }));

      setProductsList(formattedProducts);
    } catch (err) {
      console.error(
        'Load marketplace products error:',
        err
      );

      setError(
        err.message ||
          'Could not load marketplace products.'
      );
    }
  };

  // =====================================================
  // IMAGE SELECT
  // =====================================================

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Maximum 5MB
    if (file.size > 5 * 1024 * 1024) {
      setError(
        'Image size must be less than 5MB.'
      );

      e.target.value = '';
      return;
    }

    // Only image files
    if (!file.type.startsWith('image/')) {
      setError(
        'Please select a valid image file.'
      );

      e.target.value = '';
      return;
    }

    setError('');

    setImageFile(file);

    // Remove old preview URL
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    const previewUrl =
      URL.createObjectURL(file);

    setImagePreview(previewUrl);
  };

  // =====================================================
  // UPLOAD PRODUCT IMAGE
  // =====================================================

  const uploadProductImage = async (userId) => {
    if (!imageFile) {
      return '';
    }

    const fileExt =
      imageFile.name
        .split('.')
        .pop()
        .toLowerCase();

    const filePath =
      `${userId}/product-${Date.now()}.${fileExt}`;

    const {
      error: uploadError,
    } = await supabase.storage
      .from('marketplace-images')
      .upload(
        filePath,
        imageFile,
        {
          cacheControl: '3600',
          upsert: false,
        }
      );

    if (uploadError) {
      throw uploadError;
    }

    const {
      data,
    } = supabase.storage
      .from('marketplace-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  // =====================================================
  // CREATE LISTING
  // =====================================================

  const onSubmitNewProduct = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      setError(
        'You must be logged in to create a listing.'
      );
      return;
    }

    if (!title.trim()) {
      setError(
        'Please enter a product title.'
      );
      return;
    }

    if (!price || Number(price) < 0) {
      setError(
        'Please enter a valid price.'
      );
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      // ---------------------------------------------
      // Upload image
      // ---------------------------------------------

      let imageUrl = '';

      if (imageFile) {
        imageUrl =
          await uploadProductImage(
            currentUser.id
          );
      }

      // ---------------------------------------------
      // Insert listing
      // ---------------------------------------------

      const {
        data,
        error,
      } = await supabase
        .from('marketplace_listings')
        .insert({
          seller_id:
            currentUser.id,

          title:
            title.trim(),

          description:
            description.trim(),

          price:
            Number(price),

          category,

          condition,

          location:
            location.trim(),

          image_url:
            imageUrl,

          status:
            'active',
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

      if (error) {
        throw error;
      }

      // ---------------------------------------------
      // Format new product
      // ---------------------------------------------

      const newProduct = {
        id: data.id,

        title:
          data.title,

        price:
          Number(data.price),

        category:
          data.category,

        condition:
          data.condition,

        description:
          data.description || '',

        location:
          data.location || '',

        image_url:
          data.image_url || '',

        seller_id:
          data.seller_id,

        seller:
          data.profiles?.full_name ||
          data.profiles?.username ||
          'User',

        seller_username:
          data.profiles?.username || '',

        seller_avatar:
          data.profiles?.profile_image || '',

        created_at:
          data.created_at,

        updated_at:
          data.updated_at,
      };

      // Add new product at top
      setProductsList((previous) => [
        newProduct,
        ...previous,
      ]);

      // Reset
      resetForm();

      setShowCreateModal(false);

      setSuccess(
        'Your listing was posted successfully!'
      );
    } catch (err) {
      console.error(
        'Create marketplace listing error:',
        err
      );

      setError(
        err.message ||
          'Could not create listing.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // RESET FORM
  // =====================================================

  const resetForm = () => {
    setTitle('');
    setPrice('');
    setCategory('UI Kits');
    setCondition('Used');
    setDescription('');
    setLocation('');
    setImageFile(null);

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImagePreview('');
  };

  // =====================================================
  // DELETE LISTING
  // =====================================================

  const handleDeleteProduct = async (productId) => {
    if (!currentUser) {
      setError('You must be logged in.');
      return;
    }

    try {
      setError('');
      setSuccess('');

      const {
        error,
      } = await supabase
        .from('marketplace_listings')
        .delete()
        .eq('id', productId)
        .eq(
          'seller_id',
          currentUser.id
        );

      if (error) {
        throw error;
      }

      setProductsList((previous) =>
        previous.filter(
          (product) =>
            product.id !== productId
        )
      );

      setSuccess(
        'Listing deleted successfully.'
      );
    } catch (err) {
      console.error(
        'Delete listing error:',
        err
      );

      setError(
        err.message ||
          'Could not delete listing.'
      );
    }
  };

  // =====================================================
  // FILTER PRODUCTS
  // =====================================================

  const filteredProducts =
    productsList.filter((product) => {
      const search =
        searchQuery
          .trim()
          .toLowerCase();

      const matchesSearch =
        !search ||
        product.title
          .toLowerCase()
          .includes(search) ||
        product.description
          .toLowerCase()
          .includes(search) ||
        product.category
          .toLowerCase()
          .includes(search) ||
        product.location
          .toLowerCase()
          .includes(search);

      if (
        activeCategory === 'all'
      ) {
        return matchesSearch;
      }

      return (
        matchesSearch &&
        product.category ===
          activeCategory
      );
    });

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">

          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-4" />

          <p className="text-sm text-slate-400">
            Loading Marketplace...
          </p>

        </div>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="max-w-5xl mx-auto pb-12 space-y-8">

      {/* =================================================
          SUCCESS / ERROR
      ================================================= */}

      {(error || success) && (
        <div
          className={`p-4 rounded-2xl border text-sm ${
            success
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}
        >
          <div className="flex items-center justify-between gap-3">

            <span>
              {success || error}
            </span>

            <button
              type="button"
              onClick={() => {
                setError('');
                setSuccess('');
              }}
              className="opacity-70 hover:opacity-100"
            >
              <X className="w-4 h-4" />
            </button>

          </div>
        </div>
      )}

      {/* =================================================
          HERO
      ================================================= */}

      <div className="p-8 rounded-3xl bg-gradient-to-tr from-indigo-950 via-slate-900 to-purple-950 text-white shadow-xl relative overflow-hidden border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">

        <div className="relative z-10 max-w-xl">

          <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-bold uppercase tracking-wider mb-3 inline-block">
            Creator Economy
          </span>

          <h1 className="text-3xl sm:text-4xl font-extrabold font-['Outfit'] mb-2">
            Creator Digital Assets Store
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            Buy and sell high quality design
            tokens, UI kits, photography
            presets, and dev tools from
            creators.
          </p>

        </div>

        <button
          type="button"
          onClick={() => {
            setError('');
            setSuccess('');
            setShowCreateModal(true);
          }}
          className="relative z-10 px-5 py-3 bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 whitespace-nowrap transition-all"
        >
          <Plus className="w-4 h-4" />

          List Digital Asset
        </button>

      </div>

      {/* =================================================
          CATEGORY + SEARCH
      ================================================= */}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-card p-4 rounded-2xl">

        <div className="flex gap-2 overflow-x-auto w-full sm:w-auto no-scrollbar">

          {categories.map((cat) => (
            <button
              type="button"
              key={cat}
              onClick={() =>
                setActiveCategory(cat)
              }
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${
                activeCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}

        </div>

        <div className="relative w-full sm:w-64">

          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />

          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) =>
              setSearchQuery(
                e.target.value
              )
            }
            className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

        </div>

      </div>

      {/* =================================================
          PRODUCT GRID
      ================================================= */}

      {filteredProducts.length === 0 ? (

        <div className="glass-card rounded-3xl p-12 text-center">

          <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto mb-4" />

          <h3 className="font-bold text-lg text-slate-700 dark:text-slate-200">
            No products found
          </h3>

          <p className="text-sm text-slate-400 mt-2">
            Be the first creator to list something.
          </p>

          <button
            type="button"
            onClick={() => {
              setError('');
              setSuccess('');
              setShowCreateModal(true);
            }}
            className="mt-5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
          >
            <Plus className="w-4 h-4 inline mr-1" />
            List Product
          </button>

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

      {/* =================================================
          CREATE LISTING MODAL
      ================================================= */}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">

          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto glass-card bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">

            {/* Header */}

            <div className="flex items-start justify-between mb-4">

              <div>

                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">

                  <Sparkles className="w-5 h-5 text-indigo-500" />

                  List Digital Asset

                </h3>

                <p className="text-xs text-slate-400 mt-1">
                  Create a real marketplace listing.
                </p>

              </div>

              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowCreateModal(false);
                }}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

            </div>

            <form
              onSubmit={
                onSubmitNewProduct
              }
              className="space-y-4"
            >

              {/* =================================================
                  IMAGE
              ================================================= */}

              <div>

                <label className="block text-xs font-semibold text-slate-400 mb-2">
                  Product Image
                </label>

                <label className="block cursor-pointer">

                  <div className="w-full h-40 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 transition-all flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-800/50">

                    {imagePreview ? (

                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />

                    ) : (

                      <div className="text-center">

                        <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />

                        <p className="text-xs text-slate-400">
                          Click to upload image
                        </p>

                        <p className="text-[10px] text-slate-500 mt-1">
                          JPG, PNG, WEBP • Max 5MB
                        </p>

                      </div>

                    )}

                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={
                      handleImageChange
                    }
                    className="hidden"
                  />

                </label>

              </div>

              {/* =================================================
                  TITLE
              ================================================= */}

              <div>

                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Title
                </label>

                <input
                  type="text"
                  placeholder="e.g. Neon Cyberpunk Icon Set"
                  value={title}
                  onChange={(e) =>
                    setTitle(
                      e.target.value
                    )
                  }
                  className="w-full p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />

              </div>

              {/* =================================================
                  PRICE + CATEGORY
              ================================================= */}

              <div className="grid grid-cols-2 gap-3">

                <div>

                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Price
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="25"
                    value={price}
                    onChange={(e) =>
                      setPrice(
                        e.target.value
                      )
                    }
                    className="w-full p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />

                </div>

                <div>

                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Category
                  </label>

                  <select
                    value={category}
                    onChange={(e) =>
                      setCategory(
                        e.target.value
                      )
                    }
                    className="w-full p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="UI Kits">
                      UI Kits
                    </option>

                    <option value="Presets">
                      Presets
                    </option>

                    <option value="3D Models">
                      3D Models
                    </option>

                    <option value="Guides">
                      Guides
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>

                </div>

              </div>

              {/* =================================================
                  CONDITION
              ================================================= */}

              <div>

                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Condition
                </label>

                <select
                  value={condition}
                  onChange={(e) =>
                    setCondition(
                      e.target.value
                    )
                  }
                  className="w-full p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="New">
                    New
                  </option>

                  <option value="Like New">
                    Like New
                  </option>

                  <option value="Used">
                    Used
                  </option>
                </select>

              </div>

              {/* =================================================
                  LOCATION
              ================================================= */}

              <div>

                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Location
                </label>

                <div className="relative">

                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />

                  <input
                    type="text"
                    placeholder="e.g. Rajshahi, Bangladesh"
                    value={location}
                    onChange={(e) =>
                      setLocation(
                        e.target.value
                      )
                    }
                    className="w-full pl-9 p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />

                </div>

              </div>

              {/* =================================================
                  DESCRIPTION
              ================================================= */}

              <div>

                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Description
                </label>

                <textarea
                  rows="4"
                  placeholder="Describe your product..."
                  value={description}
                  onChange={(e) =>
                    setDescription(
                      e.target.value
                    )
                  }
                  className="w-full p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />

              </div>

              {/* =================================================
                  BUTTONS
              ================================================= */}

              <div className="flex gap-2 pt-2">

                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowCreateModal(false);
                  }}
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >

                  {submitting ? (

                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Posting...
                    </>

                  ) : (

                    <>
                      <Plus className="w-4 h-4" />
                      List Asset
                    </>

                  )}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}