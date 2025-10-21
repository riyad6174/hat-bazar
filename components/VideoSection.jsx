import Link from 'next/link';
import React from 'react';
import { trackEvent } from '@/utils/tracking'; // Add this import

function VideoSection() {
  // Removed: useRef and useEffect hooks, as the complex unmute logic is no longer needed.
  // The video will now reliably autoplay, but muted, which is the browser standard.

  // Add click handler for order button
  const handleOrderClick = () => {
    // This click will still implicitly attempt to unmute the video via user interaction,
    // but the component code is cleaner without the explicit event listener.
    trackEvent('order_button_click', { from: 'video_section' });
  };

  return (
    <div>
      <section className=' py-8 px-4 text-center mt-10 md:mt-16'>
        {/* Titles and text remain the same */}
        <h1 className='text-2xl md:text-3xl font-extrabold text-pink-700 mb-6 leading-tight'>
          ত্বকের উজ্জ্বলতা কি শুধু বাইরে থেকে ক্রিম মেখেই সম্ভব?
        </h1>
        <span className='text-pink-600 text-lg '>
          যতই ভালো স্কিনকেয়ার ব্যবহার করি না কেন, ভিতর থেকে যদি ত্বক পুষ্টি না
          পায় — গ্লো কিন্তু থাকে না।
        </span>
        <h2 className='text-2xl md:text-3xl font-extrabold text-pink-600 mt-3 mb-6 leading-tight'>
          তাই ত্বক কে স্থায়ীভাবে উজ্জ্বল করতে প্রয়োজন এই গ্লুটা-কোলাজেন জুস
        </h2>

        {/* Video Section */}
        <div className='relative w-full max-w-2xl mx-auto mb-8 rounded overflow-hidden h-[480px] mt-6'>
          <video
            // Ref removed
            className='w-full h-full object-cover'
            src='/assets/intro.mp4'
            autoPlay // Keeps autoplay enabled
            loop
            // Essential for reliable autoplay across browsers: MUST be muted={true}
            muted={true}
            playsInline
            controls={true}
            // Optimization attributes kept
            poster='/assets/red2.webp'
            preload='auto'
          >
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Order Button */}
        <Link
          href={'#order_form'}
          onClick={handleOrderClick}
          className='bg-gradient-to-r from-pink-400 to-pink-600 hover:from-pink-500 hover:to-green-700 text-white font-extrabold py-4 px-10 rounded-full text-xl shadow-lg transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300 focus:ring-opacity-75 animate-bounce'
        >
          অর্ডার করুন এখনি
        </Link>
      </section>
    </div>
  );
}

export default VideoSection;
