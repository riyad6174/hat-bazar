import React from 'react';

const Navbar = () => {
  return (
    <nav className='bg-[#d389c9] text-white p-2 overflow-hidden whitespace-nowrap'>
      <div className='inline-block animate-[scrollText_50s_linear_infinite]'>
        <span className='text-sm font-bold tracking-wide'>
          Hat-Bazar ওয়েবসাইটে আপনাকে স্বাগতম। &nbsp;&nbsp;&nbsp;&nbsp;
        </span>
        <span className='text-sm font-bold tracking-wide'>
          অরিজিনাল গ্লুটা-কোলাজেন জুসটি পেতে এখনি অর্ডার করুন।
          &nbsp;&nbsp;&nbsp;&nbsp;
        </span>
        <span className='text-sm font-bold tracking-wide'>
          সারা বাংলাদেশে ক্যাশ অন ডেলিভারিতে পেতে যোগাযোগ করুন এখনি।
          &nbsp;&nbsp;&nbsp;&nbsp;
        </span>
        <span className='text-sm font-bold tracking-wide'>
          প্রোডাক্টি ডেলিভারি নেয়ার সময়ে চেক করে নিতে পারবেন।
          &nbsp;&nbsp;&nbsp;&nbsp;
        </span>
        <span className='text-sm font-bold tracking-wide'>
          অরিজিনাল প্রোডাক্টটি পেতে এখনি অর্ডার করুন। &nbsp;&nbsp;&nbsp;&nbsp;
        </span>
      </div>
      <style jsx>{`
        @keyframes scrollText {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
