import React from 'react';
import {
  ShoppingBag,
  MapPin,
  User,
  Trash2,
  Package,
  CalendarDays,
  Tag,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProductCard({
  product,
  currentUser,
  onDelete,
}) {
  if (!product) return null;

  const {
    id,
    title,
    price,
    category,
    condition,
    description,
    location,
    image_url,
    seller_id,
    seller,
    seller_username,
    seller_avatar,
    created_at,
  } = product;

  const isOwner =
    currentUser?.id &&
    seller_id &&
    currentUser.id === seller_id;

  const formatDate = (date) => {
    if (!date) return '';

    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();

    if (!onDelete) return;

    const confirmed = window.confirm(
      'Are you sure you want to delete this listing?'
    );

    if (confirmed) {
      onDelete(id);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass-card rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col border border-slate-200/50 dark:border-slate-800/40 group bg-white dark:bg-slate-900/40"
    >

      {/* ================= PRODUCT IMAGE ================= */}
      <div className="h-52 relative bg-slate-100 dark:bg-slate-950 overflow-hidden">

        {image_url ? (
          <img
            src={image_url}
            alt={title || 'Marketplace product'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
            <Package className="w-10 h-10 opacity-30 mb-2" />
            <span className="text-xs">No image available</span>
          </div>
        )}

        {/* Unboxed Metadata overlays */}
        {category && (
          <div className="absolute top-3 left-3 z-10">
            <span className="px-3 py-1 bg-slate-900/80 backdrop-blur-md rounded-full text-[10px] font-bold text-white tracking-wider uppercase">
              {category}
            </span>
          </div>
        )}

        {condition && (
          <div className="absolute top-3 right-3 z-10">
            <span className="px-3 py-1 bg-white/90 dark:bg-slate-900/80 backdrop-blur-md rounded-full text-[10px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
              {condition}
            </span>
          </div>
        )}

        {/* Price Tag */}
        <div className="absolute bottom-3 right-3 px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-pink-600 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-indigo-500/20">
          ${Number(price || 0).toFixed(2)}
        </div>

        {/* Delete Owner Action */}
        {isOwner && (
          <button
            type="button"
            onClick={handleDelete}
            title="Delete listing"
            className="absolute bottom-3 left-3 w-9 h-9 rounded-xl bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-colors duration-200"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ================= PRODUCT DETAILS ================= */}
      <div className="p-5 flex-1 flex flex-col">

        {/* Seller Info (Zero-pill layout) */}
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100 dark:border-slate-800/60">
          <div className="w-8 h-8 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0">
            {seller_avatar ? (
              <img
                src={seller_avatar}
                alt={seller || 'Seller'}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-4 h-4 text-slate-400" />
            )}
          </div>

          <div className="min-w-0">
            <p className="text-xs text-slate-800 dark:text-slate-200 font-bold truncate">
              {seller || 'Unknown Seller'}
            </p>
            {seller_username && (
              <p className="text-[10px] text-slate-400 truncate">
                @{seller_username}
              </p>
            )}
          </div>

          {created_at && (
            <div className="ml-auto flex items-center gap-1 text-[9px] text-slate-400 font-semibold shrink-0">
              <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
              {formatDate(created_at)}
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 mb-1.5 line-clamp-1 group-hover:text-indigo-500 transition-colors font-['Outfit']">
          {title || 'Untitled Product'}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed flex-1 min-h-[32px]">
          {description || 'No description available.'}
        </p>

        {/* Unboxed Metadata (Separated text) */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400 dark:text-slate-400 mb-4 font-semibold">
          {location && (
            <span className="flex items-center gap-1 text-[10px]">
              <MapPin className="w-3.5 h-3.5 text-indigo-500" />
              <span className="truncate max-w-[120px]">{location}</span>
            </span>
          )}
          {location && category && <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>}
          {category && (
            <span className="flex items-center gap-1 text-[10px] text-indigo-500">
              <Tag className="w-3 h-3" />
              <span>{category}</span>
            </span>
          )}
        </div>

        {/* ================= ACTION ================= */}
        <div className="mt-auto">
          {isOwner ? (
            <div className="w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              <Package className="w-4 h-4 text-slate-400" />
              Your Listing
            </div>
          ) : (
            <motion.button
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={() => {
                alert('Purchase system will be connected next.');
              }}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-md bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-500/20 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Buy Now • ${Number(price || 0).toFixed(2)}</span>
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
