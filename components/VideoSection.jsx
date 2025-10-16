import Link from 'next/link';
import React, { useRef, useEffect } from 'react';
import { trackEvent } from '@/utils/tracking'; // Add this import

function VideoSection() {
  const videoRef = useRef(null);

  useEffect(() => {
    const videoElement = videoRef.current;

    if (videoElement) {
      // 1. Try to play the video (it will likely start muted due to browser rules)
      videoElement.play().catch((error) => {
        // Handle potential errors if autoplay is completely blocked
        console.log('Autoplay blocked. User needs to interact.', error);
      });

      // 2. Add an event listener for a user interaction (e.g., a click)
      const attemptUnmute = () => {
        if (videoElement.muted) {
          videoElement.muted = false; // Attempt to un-mute
          videoElement.play(); // Attempt to play (in case it was paused)
        }
        // Remove the listener after the first successful attempt to un-mute
        document.removeEventListener('click', attemptUnmute);
      };

      // Listen for a click on the entire document
      document.addEventListener('click', attemptUnmute);

      // Cleanup function for when the component unmounts
      return () => {
        document.removeEventListener('click', attemptUnmute);
      };
    }
  }, []);

  // Add click handler for order button
  const handleOrderClick = () => {
    trackEvent('order_button_click', { from: 'video_section' });
  };

  return (
    <div>
      <section className=' py-8 px-4 text-center mt-10 md:mt-16'>
        {/* ... (Titles and text remain the same) ... */}
        <h1 className='text-2xl md:text-3xl font-extrabold text-pink-700 mb-6 leading-tight'>
          ত্বকের উজ্জ্বলতা কি শুধু বাইরে থেকে ক্রিম মেখেই সম্ভব?
        </h1>
        <span className='text-pink-600 text-lg '>
          যতই ভালো স্কিনকেয়ার ব্যবহার করি না কেন, ভিতর থেকে যদি ত্বক পুষ্ট না
          পায় — গ্লো কিন্তু থাকে না।
        </span>
        <h2 className='text-2xl md:text-3xl font-extrabold text-pink-600 mt-3 mb-6 leading-tight'>
          তাই ত্বক কে স্থায়ীভাবে উজ্জ্বল করতে প্রয়োজন এই গ্লুটা-কোলাজেন জুস
        </h2>

        {/* Video Section */}
        <div className='relative w-full max-w-2xl mx-auto mb-8 rounded overflow-hidden h-[480px] mt-6'>
          <video
            ref={videoRef}
            className='w-full h-full object-cover'
            src='/assets/intro.mp4'
            autoPlay
            loop
            muted={true}
            playsInline
            controls={true}
            // 🚀 VIDEO OPTIMIZATION ATTRIBUTES ADDED BELOW 🚀
            poster='/assets/red2.webp' // 💡 MUST BE CREATED: A small, high-quality image preview
            preload='auto' // 💡 Tells the browser to load the video metadata and some data
            // 💡 For browsers that support multiple sources (for compatibility/size)
            // <source src="/assets/intro.webm" type="video/webm" />
          >
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Order Button (This click will trigger the un-mute attempt!) */}
        <Link
          href={'#order_form'}
          onClick={handleOrderClick} // Add this
          className='bg-gradient-to-r from-pink-400 to-pink-600 hover:from-pink-500 hover:to-green-700 text-white font-extrabold py-4 px-10 rounded-full text-xl shadow-lg transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300 focus:ring-opacity-75 animate-bounce'
        >
          অর্ডার করুন এখনি
        </Link>
      </section>
    </div>
  );
}

export default VideoSection;
