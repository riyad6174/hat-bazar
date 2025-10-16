import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Pagination, Navigation, Autoplay } from 'swiper/modules';
import Link from 'next/link';

const images = [
  '/assets/slider1.jpg',
  '/assets/slider2.png',
  '/assets/slider3.png',
  '/assets/slider4.jpg',
];

const ProductAbout = () => {
  return (
    <div className='py-4 px-4 md:px-8 '>
      <div className='container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start'>
        {/* Left Column: Benefits and Button */}
        <div className='md:p-6'>
          <h2 className='text-xl md:text-4xl text-center md:text-left font-extrabold text-pink-700 mb-6'>
            Gluta Collagen Pink Dietary Supplement এর উপকারিতাঃ
          </h2>
          <ul className='space-y-4 text-pink-900 text-lg font-bold'>
            <li className='flex items-start border-b-2 border-dotted border-pink-500'>
              <span className='text-pink-500 mr-3 mt-1'>&#10003;</span>{' '}
              <span>ত্বক খুব দ্রুত ফর্সা ও উজ্জ্বল করে।</span>
            </li>
            <li className='flex items-start border-b-2 border-dotted border-pink-500'>
              <span className='text-pink-500 mr-3 mt-1'>&#10003;</span>
              <span>
                এতে আছে Glutathion, যা মেলানিন কমিয়ে স্কিন ফেয়ার ও গ্লোয়িং
                করে তোলে।
              </span>
            </li>
            <li className='flex items-start border-b-2 border-dotted border-pink-500'>
              <span className='text-pink-500 mr-3 mt-1'>&#10003;</span>
              <span>দাগ-ছোপ, ব্রন-স্পট স্থায়ীভাবে রিমুভ করে।</span>
            </li>
            <li className='flex items-start border-b-2 border-dotted border-pink-500'>
              <span className='text-pink-500 mr-3 mt-1'>&#10003;</span>
              <span>ত্বক নরম ও মসৃণ করে।</span>
            </li>
            <li className='flex items-start border-b-2 border-dotted border-pink-500'>
              <span className='text-pink-500 mr-3 mt-1'>&#10003;</span>
              <span>স্কিন টান টান করে।</span>
            </li>
            <li className='flex items-start border-b-2 border-dotted border-pink-500'>
              <span className='text-pink-500 mr-3 mt-1'>&#10003;</span>
              <span>চুল-নখ ও শরীরের ভিতরের সৌন্দর্য রক্ষা করে।</span>
            </li>
            <li className='flex items-start border-b-2 border-dotted border-pink-500'>
              <span className='text-pink-500 mr-3 mt-1'>&#10003;</span>
              <span>
                একটি শক্তিশালী অ্যান্টিঅক্সিডেন্ট যা শরীরকে বিষমুক্ত করতে,
                ত্বকের বর্ণ হাল্কা করতে এবং অক্সিডেটিভ স্ট্রেস থেকে রক্ষা করতে
                সাহায্য করে।
              </span>
            </li>
          </ul>
          <div className='mt-8 flex items-center justify-center md:justify-start'>
            <Link
              href={'#order_form'}
              className='bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg transform transition-all duration-300 hover:scale-105'
            >
              অর্ডার করতে চাই
            </Link>
          </div>
        </div>

        {/* Right Column: Swiper Image Slider */}
        <div className='w-full'>
          <Swiper
            className='w-full h-full rounded-lg shadow-xl overflow-hidden'
            modules={[Pagination, Navigation, Autoplay]}
            spaceBetween={0} // Space between slides is not needed for single-image view
            slidesPerView={1}
            // pagination={{ clickable: true }}
            // navigation={true}
            loop={true}
            autoplay={{
              delay: 2500, // Time in ms between slides
              disableOnInteraction: false, // Continue autoplay after user interaction
            }}
          >
            {images.map((image, index) => (
              <SwiperSlide key={index}>
                <div className='w-full h-full flex justify-center items-center'>
                  <img
                    src={image}
                    alt={`Product Image ${index + 1}`}
                    className='w-full h-full object-cover'
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
};

export default ProductAbout;
