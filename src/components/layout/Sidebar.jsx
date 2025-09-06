import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AiOutlineHome,
  AiOutlineSearch,
  AiOutlineAppstore,
  AiOutlineTrophy,
  AiOutlineCompass,
  AiOutlineBook,
  AiOutlineSend,
} from "react-icons/ai";
import { LuChartLine, LuFolderOpen, LuUser } from "react-icons/lu";
import { RiRobot2Line } from "react-icons/ri";
import { FiShield } from "react-icons/fi";
import { FaRegFile } from "react-icons/fa";
import { ChevronRight, BellIcon } from "lucide-react";

const Sidebar = ({ onSubSidebarToggle }) => {
  const location = useLocation();

  const navigationItems = [
    { path: "/", label: "Dashboard", icon: AiOutlineHome, hasSubItems: false },
    {
      path: "/rca-dashboard",
      label: "RCA Dashboard",
      icon: LuChartLine,
      hasSubItems: false,
    },
    {
      path: null,
      label: "AI RCA Guidance",
      icon: RiRobot2Line,
      hasSubItems: true,
    },
    {
      path: "/pattern-detector",
      label: "Pattern & Duplicate Detector",
      icon: AiOutlineSearch,
      hasSubItems: false,
    },
    {
      path: "/playbook-recommender",
      label: "Playbook Recommender",
      icon: AiOutlineBook,
      hasSubItems: false,
    },
    {
      path: "/customer-rca-summary",
      label: "Customer RCA Summary",
      icon: FaRegFile,
      hasSubItems: false,
    },
    {
      path: "/alert-correlation",
      label: "Alert Correlation",
      icon: BellIcon,
      hasSubItems: false,
    },
    {
      path: "/compliance-audit",
      label: "Compliance & Audit",
      icon: FiShield,
      hasSubItems: false,
    },
  ];

  const handleItemClick = (item, e) => {
    if (item.hasSubItems) {
      e.preventDefault(); // Prevent navigation
      onSubSidebarToggle(true);
    } else {
      onSubSidebarToggle(false);
    }
  };

  // Check if AI RCA Guidance should be active (when any sub-item is open)
  const isAIRCAGuidanceActive =
    location.pathname.startsWith("/ai-rca-guidance");

  return (
    <motion.aside
      className="fixed left-0 top-16 bottom-0 w-18 bg-white border-r border-gray-200 shadow-sm z-40"
      initial={{ x: -64 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <nav className="p-1">
        <ul className="space-y-1">
          {navigationItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <motion.li
                key={item.path || item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
              >
                {item.path ? (
                  <NavLink
                    to={item.path}
                    onClick={(e) => handleItemClick(item, e)}
                    className={({ isActive }) =>
                      `flex flex-col items-center justify-center px-1 py-2 transition-colors duration-200 relative ${
                        isActive
                          ? "text-green-600 border-l-2 border-green-600 "
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`
                    }
                  >
                    <IconComponent className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-semibold text-center leading-tight">
                      {item.label}
                    </span>
                    {item.hasSubItems && (
                      <ChevronRight className="w-3 h-3 text-gray-400 absolute top-1 right-1" />
                    )}
                  </NavLink>
                ) : (
                  <button
                    onClick={(e) => handleItemClick(item, e)}
                    className={`flex items-center justify-center px-1 py-2 rounded-lg transition-colors duration-200 relative w-full ${
                      item.label === "AI RCA Guidance" && isAIRCAGuidanceActive
                        ? "text-green-600"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center relative">
                      <IconComponent className="flex  items-center justify-center w-5 h-5 mb-1" />
                      <span className="text-[10px] font-semibold text-center leading-tight">
                        {item.label}
                      </span>
                    </div>
                    {item.hasSubItems && (
                      <ChevronRight className=" absolute w-4 h-4 text-gray-400 right-[-4px]" />
                    )}
                  </button>
                )}
              </motion.li>
            );
          })}
        </ul>
      </nav>
    </motion.aside>
  );
};

export default Sidebar;
