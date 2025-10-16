import React from 'react';
import { BsFillCheckCircleFill } from 'react-icons/bs';

const OrderSuccessModal = ({ orderDetails, onClose }) => {
  if (!orderDetails) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-70 backdrop-blur-sm'>
      <div className='bg-white rounded-lg shadow-2xl p-6 w-full max-w-lg mx-4 text-center transform transition-all scale-95 md:scale-100'>
        {/* Header */}
        <BsFillCheckCircleFill className='text-green-500 text-6xl mx-auto mb-4' />
        <h2 className='text-2xl md:text-3xl font-bold text-gray-800 mb-2'>
          অর্ডার সফল হয়েছে! 🎉
        </h2>
        <p className='text-gray-600 mb-6'>
          অর্ডার নং: <span className='font-bold'>{orderDetails.orderId}</span>
        </p>

        {/* Order Details */}
        <div className='border-t border-b py-4 mb-4'>
          <div className='flex justify-between font-semibold text-gray-700'>
            <span>মোট মূল্য:</span>
            <span>৳{orderDetails.totalPrice}</span>
          </div>
          <div className='flex justify-between font-semibold text-gray-700'>
            <span>ডেলিভারি চার্জ:</span>
            <span>৳{orderDetails.shippingCharge}</span>
          </div>
          <div className='flex justify-between font-bold text-xl text-pink-600 mt-2'>
            <span>মোট পেমেন্ট:</span>
            <span>৳{orderDetails.grandTotal}</span>
          </div>
        </div>

        <p className='text-sm text-gray-500 mb-6'>
          আপনার অর্ডারটি দ্রুততম সময়ে আপনার ঠিকানায় পাঠানো হবে।
        </p>

        {/* Close Button */}
        <button
          onClick={onClose}
          className='bg-pink-600 hover:bg-pink-700 text-white py-3 px-8 rounded-full font-bold transition-colors shadow-lg'
        >
          বন্ধ করুন
        </button>
      </div>
    </div>
  );
};

export default OrderSuccessModal;
