import React from 'react';
import heroImage from '../public/assets/hero.jpg';
import Image from 'next/image';
const Hero = () => {
  return (
    <div className='relative w-full h-[20vh] md:h-[80vh] overflow-hidden'>
      <Image
        src={heroImage}
        width={1000}
        height={600}
        className='object-cover w-full'
      />
      {/* Overlay to darken the image */}
      {/* <div className='absolute inset-0 bg-black opacity-40'></div> */}
    </div>
  );
};

export default Hero;
