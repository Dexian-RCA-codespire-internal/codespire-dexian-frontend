import React from "react";
import { motion } from "framer-motion";
import { BellIcon } from "lucide-react";

const Header = () => {
  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="h-16 flex items-center justify-between px-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Codespire RCA</h1>
        </div>
        {/* before proofile I want a notification icon 2 as notification number*/}

        <div className="flex items-center space-x-4 gap-4 cursor-pointer">
          <div className="w-8 h-8 rounded-full flex items-center justify-center">
            <span className="text-gray-600 text-sm relative">
              <BellIcon className="w-6 h-6 p-1 text-gray-600" />
              <span className="text-white rounded-full px-[6px] bg-red-600 text-sm absolute left-4 bottom-4">2</span>
            </span>
          </div>
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-gray-600 text-sm">👤</span>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
