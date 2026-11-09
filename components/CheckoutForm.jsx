import React, { useState, useEffect, useRef } from 'react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { BsCheckCircleFill } from 'react-icons/bs';
import { toast } from 'react-hot-toast';
import { useCart } from '@/context/CartContext';
import { trackEvent, trackFormField } from '@/utils/tracking';
import {
  CHECKOUT_FIELDS,
  getCheckoutProgress,
  normalizePhone,
  validateCheckoutField,
  validateCheckoutForm,
} from '@/lib/checkoutValidation';
import {
  loadCheckoutDraft,
  saveCheckoutDraft,
  useCheckoutTracking,
} from '@/utils/useCheckoutTracking';
import { motion } from 'framer-motion';

const inputBase = 'w-full bg-white border pl-4 pr-11 py-3.5 font-body text-sm outline-none transition-all rounded-xl text-on-surface placeholder:text-outline/60';
const inputNormal = `${inputBase} border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/10`;
const inputError  = `${inputBase} border-error focus:border-error focus:ring-2 focus:ring-error/10`;

const FieldCheck = ({ valid, className = '' }) => (
  <BsCheckCircleFill
    aria-hidden="true"
    className={`w-4 h-4 transition-colors duration-300 ${valid ? 'text-emerald-500' : 'text-gray-300'} ${className}`}
  />
);

const insideInput = 'absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none';

const CheckoutForm = ({ onOrderSuccess }) => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    district: '',
    address: '',
  });
  const [errors, setErrors] = useState({});
  const [shippingCharge, setShippingCharge] = useState(120);
  const [isLoading, setIsLoading] = useState(false);
  const [formStarted, setFormStarted] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const submitLock = useRef(false);

  const subtotal = getCartTotal();
  const grandTotal = subtotal + shippingCharge;
  const progress = getCheckoutProgress(formData);
  const isFieldValid = (key) => !validateCheckoutField(key, formData[key]);
  const orderItems = cartItems.map((item) => ({
    title: item.name, selectedColor: 'N/A', quantity: item.quantity, price: item.price,
  }));

  const validPhone = normalizePhone(formData.phoneNumber);
  const { getToken, pauseTracking, resumeTracking, finishTracking } = useCheckoutTracking(
    validPhone && orderItems.length > 0
      ? {
          phone: validPhone,
          name: formData.fullName,
          district: formData.district,
          address: formData.address,
          items: orderItems,
          totalPrice: subtotal,
          shippingCharge,
          grandTotal,
          progress,
        }
      : null
  );

  // Restored after mount so the server and client render the same empty form.
  useEffect(() => {
    const draft = loadCheckoutDraft();
    if (draft) {
      setFormData((prev) => ({ ...prev, ...draft }));
      setFormStarted(true);
    }
    setDraftLoaded(true);
  }, []);

  useEffect(() => {
    if (draftLoaded) saveCheckoutDraft(formData);
  }, [formData, draftLoaded]);

  useEffect(() => {
    setShippingCharge(formData.district === 'Inside Dhaka' ? 60 : 120);
  }, [formData.district]);

  useEffect(() => {
    if (!formStarted && (formData.fullName || formData.phoneNumber || formData.district || formData.address)) {
      trackEvent('form_start');
      setFormStarted(true);
    }
  }, [formData, formStarted]);

  const updateField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const { [key]: _resolved, ...rest } = prev;
      const message = validateCheckoutField(key, value);
      return message ? { ...rest, [key]: message } : rest;
    });
    trackFormField(key);
  };

  const validateForm = () => {
    const newErrors = validateCheckoutForm(formData);
    setErrors(newErrors);

    const invalidFields = CHECKOUT_FIELDS.filter(({ key }) => newErrors[key]);
    if (invalidFields.length === 0) return true;

    const [first] = invalidFields;
    toast.error(
      invalidFields.length === 1
        ? `${first.label}: ${newErrors[first.key]}`
        : `এই তথ্যগুলো ঠিক করুন: ${invalidFields.map(({ label }) => label).join(', ')}`,
      { id: 'checkout-validation', position: 'top-center' }
    );
    document.getElementById(`checkout-${first.key}`)?.focus();
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitLock.current) return;
    if (!validateForm()) return;
    if (cartItems.length === 0) { alert('আপনার ব্যাগ খালি!'); return; }

    submitLock.current = true;
    setIsLoading(true);
    pauseTracking();
    const bdTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' });
    const phoneLastFive = formData.phoneNumber.slice(-5);
    const checkoutToken = getToken();

    const sheetData = {
      name: formData.fullName,
      phone: formData.phoneNumber,
      district: formData.district,
      address: formData.address,
      items: JSON.stringify(orderItems),
      totalPrice: subtotal,
      shippingCharge,
      grandTotal,
      // Stable for this checkout, so a retry can't be recorded as a new order.
      orderId: `ORD-${phoneLastFive}-${checkoutToken.split('-')[0].slice(-4)}`,
      orderDate: bdTime,
      submissionTime: bdTime,
      sheetName: 'Orders',
      checkoutToken,
    };

    let orderPlaced = false;
    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sheetData),
      });
      if (response.ok) {
        orderPlaced = true;
        finishTracking();
        trackEvent('purchase', {
          ecommerce: {
            transaction_id: sheetData.orderId,
            value: grandTotal,
            currency: 'BDT',
            shipping: shippingCharge,
            items: cartItems.map((item) => ({
              item_id: String(item.id),
              item_name: item.name,
              item_category: item.category || '',
              price: item.price,
              quantity: item.quantity,
            })),
          },
          user_data: {
            name: formData.fullName,
            phone: formData.phoneNumber,
            district: formData.district,
            address: formData.address,
          },
        });
        onOrderSuccess(sheetData);
        clearCart();
      } else {
        alert('অর্ডার সাবমিট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Error submitting order. Please check your connection.');
    } finally {
      if (!orderPlaced) resumeTracking();
      submitLock.current = false;
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="space-y-4">
        <h2 className="font-display text-2xl md:text-3xl text-on-surface">Shipping Details</h2>
        <div
          role="progressbar"
          aria-label="Form completion"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-body text-[10px] font-bold text-outline uppercase tracking-widest">Form Completion</span>
            <span className={`font-body text-xs font-bold transition-colors duration-500 ${progress === 100 ? 'text-emerald-600' : 'text-primary'}`}>{progress}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-surface-dim overflow-hidden">
            <motion.div
              className={`h-full rounded-full transition-colors duration-500 ${progress === 100 ? 'bg-emerald-500' : 'bg-primary'}`}
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 24 }}
            />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Full Name */}
        <div>
          <label className="font-body text-[10px] font-bold text-outline uppercase tracking-widest mb-2 block">Full Name</label>
          <div className="relative">
            <input
              id="checkout-fullName"
              className={errors.fullName ? inputError : inputNormal}
              placeholder="আপনার পুরো নাম লিখুন"
              type="text"
              value={formData.fullName}
              aria-invalid={!!errors.fullName}
              onChange={(e) => updateField('fullName', e.target.value)}
            />
            <FieldCheck valid={isFieldValid('fullName')} className={insideInput} />
          </div>
          {errors.fullName && <p className="text-error text-xs mt-1.5">{errors.fullName}</p>}
        </div>

        {/* Phone */}
        <div>
          <label className="font-body text-[10px] font-bold text-outline uppercase tracking-widest mb-2 block">Phone Number</label>
          <div className={`relative pr-10 flex items-center border rounded-xl overflow-hidden bg-white transition-all ${errors.phoneNumber ? 'border-error ring-2 ring-error/10' : 'border-outline-variant focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10'}`}>
            <PhoneInput
              id="checkout-phoneNumber"
              defaultCountry="BD"
              value={formData.phoneNumber}
              aria-invalid={!!errors.phoneNumber}
              onChange={(val) => updateField('phoneNumber', val || '')}
              className="w-full"
              inputClassName="flex-1 w-full px-4 py-3.5 font-body text-sm outline-none bg-transparent text-on-surface placeholder:text-outline/60"
            />
            <FieldCheck valid={isFieldValid('phoneNumber')} className={insideInput} />
          </div>
          {errors.phoneNumber && <p className="text-error text-xs mt-1.5">{errors.phoneNumber}</p>}
        </div>

        {/* Zone */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="font-body text-[10px] font-bold text-outline uppercase tracking-widest block">Select Delivery Zone</label>
            <FieldCheck valid={isFieldValid('district')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Inside Dhaka', charge: '60 tk' },
              { label: 'Outside Dhaka', charge: '120 tk' },
            ].map(({ label, charge }, index) => (
              <motion.button
                type="button"
                key={label}
                id={index === 0 ? 'checkout-district' : undefined}
                onClick={() => updateField('district', label)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between text-left ${
                  formData.district === label
                    ? 'border-primary bg-primary/5'
                    : errors.district
                      ? 'border-error bg-white'
                      : 'border-outline-variant bg-white hover:border-primary/40'
                }`}
              >
                <div>
                  <p className={`font-body font-bold text-sm leading-tight ${formData.district === label ? 'text-primary' : 'text-on-surface'}`}>{label}</p>
                  <p className="font-body text-[10px] text-tertiary mt-0.5">{charge}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-2 ${formData.district === label ? 'border-primary' : 'border-outline-variant'}`}>
                  {formData.district === label && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </div>
              </motion.button>
            ))}
          </div>
          {errors.district && <p className="text-error text-xs mt-1.5">{errors.district}</p>}
        </div>

        {/* Address */}
        <div>
          <label className="font-body text-[10px] font-bold text-outline uppercase tracking-widest mb-2 block">Full Address</label>
          <div className="relative">
            <input
              id="checkout-address"
              className={errors.address ? inputError : inputNormal}
              placeholder="বাড়ি নং, রাস্তা নং, থানা, উপজেলা"
              type="text"
              value={formData.address}
              aria-invalid={!!errors.address}
              onChange={(e) => updateField('address', e.target.value)}
            />
            <FieldCheck valid={isFieldValid('address')} className={insideInput} />
          </div>
          {errors.address && <p className="text-error text-xs mt-1.5">{errors.address}</p>}
        </div>

        {/* Order Summary */}
        <div className="bg-surface-container-low rounded-2xl border border-surface-dim overflow-hidden">
          <div className="px-5 py-4 border-b border-surface-dim">
            <h3 className="font-display text-lg text-on-surface">Order Summary</h3>
          </div>
          <div className="px-5 py-4 space-y-2.5">
            <div className="flex justify-between text-sm">
              <span className="text-tertiary">Subtotal</span>
              <span className="font-medium text-on-surface">{subtotal}৳</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-tertiary">Shipping</span>
              <span className="font-medium text-on-surface">{shippingCharge}৳</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t border-surface-dim pt-2.5 mt-1">
              <span className="text-on-surface">Total</span>
              <span className="text-primary">{grandTotal}৳</span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: isLoading ? 1 : 1.02 }}
          whileTap={{ scale: isLoading ? 1 : 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          className="w-full bg-primary text-on-primary font-body font-bold py-4 rounded-full uppercase tracking-[0.2em] shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:bg-outline disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-lg animate-spin">refresh</span>
              অর্ডার হচ্ছে...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Complete Order
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </span>
          )}
        </motion.button>

      </form>
    </motion.div>
  );
};

export default CheckoutForm;
