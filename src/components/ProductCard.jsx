import React, { useState } from 'react';
import {
  ShoppingBag,
  MapPin,
  User,
  Trash2,
  Package,
  CalendarDays,
  Tag,
  MessageSquare,
  X,
  CreditCard,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

export default function ProductCard({
  product,
  currentUser,
  onDelete,
}) {
  const navigate = useNavigate();
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentStep, setPaymentStep] = useState('form'); // form -> processing -> success
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');

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

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    setPaymentStep('processing');
    setTimeout(() => {
      setPaymentStep('success');
    }, 2000);
  };

  const closeCheckout = () => {
    setShowCheckout(false);
    setPaymentStep('form');
    setCardNumber('');
    setCardExpiry('');
    setCardCvc('');
    setCardName('');
  };

  const sellerProfilePath = seller_id === currentUser?.id ? "/profile" : `/profile/${seller_id}`;

  return (
    <>
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

          {/* Seller Info (Zero-pill layout - Clickable Link) */}
          <Link to={sellerProfilePath} className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100 dark:border-slate-800/60 hover:opacity-85 transition-opacity">
            <div className="w-8 h-8 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0 ring-2 ring-indigo-500/20">
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
              <p className="text-xs text-slate-800 dark:text-slate-200 font-bold truncate hover:text-indigo-500 transition-colors">
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
          </Link>

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
              <div className="w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/20">
                <Package className="w-4 h-4 text-slate-400" />
                Your Listing
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={() => navigate(`/chat?userId=${seller_id}`)}
                  className="py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Message</span>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={() => setShowCheckout(true)}
                  className="py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-md bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-500/25 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Buy Now</span>
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* ================= CHECKOUT MODAL ================= */}
      <AnimatePresence>
        {showCheckout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeCheckout}
              className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              className="w-full max-w-md bg-white dark:bg-[#0F1122] rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/60 shadow-2xl relative z-10 no-scrollbar max-h-[90vh] overflow-y-auto text-slate-900 dark:text-white"
            >
              {paymentStep === 'form' && (
                <>
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <h3 className="text-lg font-extrabold font-['Outfit'] flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-indigo-500" />
                        <span>Secure Checkout</span>
                      </h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                        Complete your purchase safely
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={closeCheckout}
                      className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                    >
                      <X className="w-4.5 h-4.5" />
                    </button>
                  </div>

                  {/* Product Details Box */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/40 mb-5 flex gap-3.5">
                    {image_url && (
                      <img src={image_url} alt={title} className="w-16 h-16 rounded-xl object-cover border border-slate-200/10" />
                    )}
                    <div className="min-w-0 flex-1">
                      <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-500 text-[9px] font-extrabold rounded uppercase tracking-wider">
                        {category}
                      </span>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mt-1.5 truncate">
                        {title}
                      </h4>
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 font-extrabold mt-0.5">
                        ${Number(price || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Cardholder Name</label>
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/40 rounded-xl text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Card Number</label>
                      <input
                        type="text"
                        required
                        maxLength="19"
                        placeholder="•••• •••• •••• ••••"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/40 rounded-xl text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Expiry Date</label>
                        <input
                          type="text"
                          required
                          maxLength="5"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/40 rounded-xl text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">CVV / CVC</label>
                        <input
                          type="password"
                          required
                          maxLength="4"
                          placeholder="•••"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/40 rounded-xl text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 font-medium"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-xs text-slate-400 font-bold border-t border-slate-100 dark:border-slate-800/50">
                      <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5 text-indigo-500" /> Secured Encryption</span>
                      <span>Total: ${Number(price || 0).toFixed(2)}</span>
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-500/20 cursor-pointer transition-all"
                    >
                      Authorize Payment
                    </motion.button>
                  </form>
                </>
              )}

              {paymentStep === 'processing' && (
                <div className="py-12 text-center space-y-4">
                  <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto" />
                  <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-base font-['Outfit']">Processing Payment</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">Please do not refresh or close this window. Securing transaction credentials...</p>
                </div>
              )}

              {paymentStep === 'success' && (
                <div className="py-10 text-center space-y-5">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 15 }}
                    className="w-16 h-16 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto"
                  >
                    <CheckCircle2 className="w-9 h-9" />
                  </motion.div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-lg font-['Outfit']">Purchase Complete!</h4>
                    <p className="text-xs text-slate-400 mt-1 bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3 max-w-xs mx-auto">
                      Thank you! Your order was successful. The files and credentials for <strong>{title}</strong> have been saved to your Purchased Inventory.
                    </p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    type="button"
                    onClick={closeCheckout}
                    className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-xs rounded-xl cursor-pointer"
                  >
                    Close Window
                  </motion.button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
