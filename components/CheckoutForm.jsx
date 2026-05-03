import React, { useState, useEffect } from 'react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { useCart } from '@/context/CartContext';
import { trackEvent, trackFormField } from '@/utils/tracking';
import { motion } from 'framer-motion';

const inputBase = 'w-full bg-white border px-4 py-3.5 font-body text-sm outline-none transition-all rounded-xl text-on-surface placeholder:text-outline/60';
const inputNormal = `${inputBase} border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/10`;
const inputError  = `${inputBase} border-error focus:border-error focus:ring-2 focus:ring-error/10`;

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

  useEffect(() => {
    setShippingCharge(formData.district === 'Inside Dhaka' ? 60 : 120);
  }, [formData.district]);

  useEffect(() => {
    if (!formStarted && (formData.fullName || formData.phoneNumber || formData.district || formData.address)) {
      trackEvent('form_start');
      setFormStarted(true);
    }
  }, [formData, formStarted]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'সম্পূর্ণ নামটি লিখুন';
    if (!formData.phoneNumber) newErrors.phoneNumber = 'ফোন নাম্বার টি লিখুন';
    if (formData.phoneNumber && formData.phoneNumber.length < 11) newErrors.phoneNumber = 'ফোন নাম্বারটি সঠিক নয়.';
    if (!formData.district) newErrors.district = 'জোন সিলেক্ট করুন';
    if (!formData.address.trim()) newErrors.address = 'ঠিকানা টি লিখুন';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (cartItems.length === 0) { alert('আপনার ব্যাগ খালি!'); return; }

    setIsLoading(true);
    const bdTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' });
    const subtotal = getCartTotal();
    const grandTotal = subtotal + shippingCharge;
    const phoneLastFive = formData.phoneNumber.slice(-5);

    const sheetData = {
      name: formData.fullName,
      phone: formData.phoneNumber,
      district: formData.district,
      address: formData.address,
      items: JSON.stringify(cartItems.map(item => ({
        title: item.name, selectedColor: 'N/A', quantity: item.quantity, price: item.price
      }))),
      totalPrice: subtotal,
      shippingCharge,
      grandTotal,
      orderId: `ORD-${phoneLastFive}-${Date.now().toString().slice(-4)}`,
      orderDate: bdTime,
      submissionTime: bdTime,
      sheetName: 'Orders',
    };

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sheetData),
      });
      if (response.ok) {
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
      <h2 className="font-display text-2xl md:text-3xl text-on-surface">Shipping Details</h2>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Full Name */}
        <div>
          <label className="font-body text-[10px] font-bold text-outline uppercase tracking-widest mb-2 block">Full Name</label>
          <input
            className={errors.fullName ? inputError : inputNormal}
            placeholder="আপনার পুরো নাম লিখুন"
            type="text"
            value={formData.fullName}
            onChange={(e) => { setFormData({ ...formData, fullName: e.target.value }); trackFormField('fullName'); }}
          />
          {errors.fullName && <p className="text-error text-xs mt-1.5">{errors.fullName}</p>}
        </div>

        {/* Phone */}
        <div>
          <label className="font-body text-[10px] font-bold text-outline uppercase tracking-widest mb-2 block">Phone Number</label>
          <div className={`flex items-center border rounded-xl overflow-hidden bg-white transition-all ${errors.phoneNumber ? 'border-error ring-2 ring-error/10' : 'border-outline-variant focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10'}`}>
            <PhoneInput
              defaultCountry="BD"
              value={formData.phoneNumber}
              onChange={(val) => { setFormData({ ...formData, phoneNumber: val }); trackFormField('phoneNumber'); }}
              className="w-full"
              inputClassName="flex-1 w-full px-4 py-3.5 font-body text-sm outline-none bg-transparent text-on-surface placeholder:text-outline/60"
            />
          </div>
          {errors.phoneNumber && <p className="text-error text-xs mt-1.5">{errors.phoneNumber}</p>}
        </div>

        {/* Zone */}
        <div>
          <label className="font-body text-[10px] font-bold text-outline uppercase tracking-widest mb-3 block">Select Delivery Zone</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Inside Dhaka', charge: '60 tk' },
              { label: 'Outside Dhaka', charge: '120 tk' },
            ].map(({ label, charge }) => (
              <motion.button
                type="button"
                key={label}
                onClick={() => { setFormData({ ...formData, district: label }); trackFormField('district'); }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between text-left ${
                  formData.district === label
                    ? 'border-primary bg-primary/5'
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
          <input
            className={errors.address ? inputError : inputNormal}
            placeholder="বাড়ি নং, রাস্তা নং, থানা, উপজেলা"
            type="text"
            value={formData.address}
            onChange={(e) => { setFormData({ ...formData, address: e.target.value }); trackFormField('address'); }}
          />
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
              <span className="font-medium text-on-surface">{getCartTotal()}৳</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-tertiary">Shipping</span>
              <span className="font-medium text-on-surface">{shippingCharge}৳</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t border-surface-dim pt-2.5 mt-1">
              <span className="text-on-surface">Total</span>
              <span className="text-primary">{getCartTotal() + shippingCharge}৳</span>
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
