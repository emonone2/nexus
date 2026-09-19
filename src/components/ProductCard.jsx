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
      return new Date(date).toLocaleDateString('en-BD', {
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
    <div className="glass-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col border border-slate-200 dark:border-slate-800 group bg-white dark:bg-slate-900">

      {/* ================= PRODUCT IMAGE ================= */}
      <div className="h-48 relative bg-slate-100 dark:bg-slate-800 overflow-hidden">

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
            <Package className="w-12 h-12 opacity-40 mb-2" />
            <span className="text-xs">
              No image available
            </span>
          </div>
        )}

        {/* Category */}
        {category && (
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 bg-slate-950/80 backdrop-blur-md rounded-full text-[10px] font-bold text-white uppercase tracking-wider">
              {category}
            </span>
          </div>
        )}

        {/* Condition */}
        {condition && (
          <div className="absolute top-3 right-3">
            <span className="px-2.5 py-1 bg-white/90 dark:bg-slate-950/80 backdrop-blur-md rounded-full text-[10px] font-bold text-slate-700 dark:text-white">
              {condition}
            </span>
          </div>
        )}

        {/* Price */}
        <div className="absolute bottom-3 right-3 px-3 py-1 bg-gradient-to-r from-indigo-600 to-pink-600 text-white font-extrabold text-sm rounded-xl shadow-lg">
          ${Number(price || 0).toFixed(2)}
        </div>

        {/* Delete button — only owner */}
        {isOwner && (
          <button
            type="button"
            onClick={handleDelete}
            title="Delete listing"
            className="absolute bottom-3 left-3 w-9 h-9 rounded-xl bg-red-500/90 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ================= PRODUCT DETAILS ================= */}
      <div className="p-4 flex-1 flex flex-col">

        {/* Seller */}
        <div className="flex items-center gap-2 mb-3">

          <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0">

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
            <p className="text-xs text-slate-700 dark:text-slate-200 font-semibold truncate">
              {seller || 'Unknown Seller'}
            </p>

            {seller_username && (
              <p className="text-[10px] text-slate-400 truncate">
                @{seller_username}
              </p>
            )}
          </div>

          {created_at && (
            <div className="ml-auto flex items-center gap-1 text-[9px] text-slate-400 shrink-0">
              <CalendarDays className="w-3 h-3" />
              {formatDate(created_at)}
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 mb-1 line-clamp-1 group-hover:text-indigo-500 transition-colors font-['Outfit']">
          {title || 'Untitled Product'}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 min-h-[32px]">
          {description || 'No description available.'}
        </p>

        {/* Location */}
        {location && (
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-3">
            <MapPin className="w-3.5 h-3.5" />
            <span className="truncate">
              {location}
            </span>
          </div>
        )}

        {/* Category + Condition */}
        <div className="flex items-center gap-2 mb-4">

          {category && (
            <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-semibold">
              <Tag className="w-3 h-3" />
              {category}
            </span>
          )}

          {condition && (
            <span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-semibold">
              {condition}
            </span>
          )}

        </div>

        {/* ================= ACTION ================= */}
        <div className="mt-auto">

          {isOwner ? (
            <div className="w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              <Package className="w-4 h-4" />
              Your Listing
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                alert(
                  'Purchase system will be connected next.'
                );
              }}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-500/20"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>
                Buy Now • ${Number(price || 0).toFixed(2)}
              </span>
            </button>
          )}

        </div>
      </div>
    </div>
  );
}