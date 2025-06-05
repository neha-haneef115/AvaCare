import React from 'react';
import { FaHandHoldingHeart } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-white max-w-6xl mx-auto border-y-1 text-center  mt-17  border-black text-black  py-6 px-4">
     
        <p className="font-semibold text-base md:text-lg text-black  mb-2">
          © {new Date().getFullYear()} AvaCare. All rights reserved.
        </p>
        <p className="flex items-center text-black justify-center gap-2 text-sm text-gray-600 ">
          Built with 
          <FaHandHoldingHeart className="text-[#a7bd2a] text-[22px] animate-pulse" />
          by Neha Haneef
        </p>
     
    </footer>
  );
};

export default Footer;
