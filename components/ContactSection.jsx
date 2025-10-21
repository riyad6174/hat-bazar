import React from 'react';
import { BsWhatsapp, BsMessenger } from 'react-icons/bs';

const ContactSection = () => {
  return (
    <div className='bg-[#f6339a] py-12 px-4 text-center'>
      <div className='container mx-auto max-w-2xl'>
        {/* Main Text */}
        <p className='text-pink-100 text-lg md:text-2xl font-bold mb-6 leading-tight'>
          আমাদের মেসেঞ্জারে ২৪ ঘন্টা প্রতিনিধি এক্টিভ থাকে কোন{' '}
          <br className='hidden md:block' />
          সমস্যা হলে সাথে সাথে মেসেঞ্জারে মেসেজ করবেন।
        </p>

        {/* Buttons Container */}
        <div className='flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-4'>
          {/* Messenger Button */}
          <a
            href='https://m.me/hatbazarlive' // Replace with your Messenger page link
            target='_blank'
            rel='noopener noreferrer'
            className='w-full md:w-auto flex items-center justify-center space-x-2 px-6 py-3 rounded-lg text-lg font-semibold transition-colors duration-200
                       bg-blue-600 hover:bg-blue-700 text-white shadow-md border-2 border-blue-600 hover:border-blue-700'
          >
            <BsMessenger className='text-2xl' />
            <span>মেসেঞ্জার</span>
          </a>

          {/* WhatsApp Button */}
          <a
            href='https://wa.me/8801794855675' // Replace with your WhatsApp number
            target='_blank'
            rel='noopener noreferrer'
            className='w-full md:w-auto flex items-center justify-center space-x-2 px-6 py-3 rounded-lg text-lg font-semibold transition-colors duration-200
                       bg-green-600 hover:bg-green-700 text-white shadow-md border-2 border-green-600 hover:border-green-700'
          >
            <BsWhatsapp className='text-2xl' />
            <span>হোয়াটসঅ্যাপ</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ContactSection;
