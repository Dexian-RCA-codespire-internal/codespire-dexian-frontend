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
  AiOutlineBarChart,
} from "react-icons/ai";
import { LuFolderOpen, LuUser } from "react-icons/lu";
import { RiAiGenerate2 } from "react-icons/ri";
import { FiShield } from "react-icons/fi";
import { FaRegFile } from "react-icons/fa";
import { ChevronRight, BellIcon } from "lucide-react";
import { getFilteredNavigationItems, isFeatureEnabled } from "../../config/navigation";

const Sidebar = ({ onSubSidebarToggle }) => {
  const location = useLocation();

  // Check if we're on an invalid/404 page
  const isValidRoute = () => {
    const path = location.pathname;
    
    // Valid exact routes
    if (path === '/') return true;
    
    // Valid auth routes
    if (path.match(/^\/auth/)) return true;
    
    // Valid protected routes with proper patterns
    const validRoutes = [
      /^\/rca-dashboard$/,  // Exact match for rca-dashboard
      /^\/investigation\/[^\/]+$/,  // investigation with ticketId
      /^\/analysis\/[^\/]+\/[^\/]+$/,  // analysis with id and ticketId
      /^\/resolution\/[^\/]+$/,  // resolution with ticketId
      /^\/complete-rca\/[^\/]+$/,  // complete-rca with ticketId
      /^\/pattern-detector$/,  // exact match
      /^\/playbook-recommender$/,  // exact match
      /^\/customer-rca-summary$/,  // exact match
      /^\/alert-correlation$/,  // exact match
      /^\/compliance-audit$/,  // exact match
      /^\/ai-rca-guidance\/add-integration$/  // exact match for add-integration
    ];
    
    return validRoutes.some(route => route.test(path));
  };
  
  const is404Page = !isValidRoute();


  // Icon mapping for dynamic navigation
  const iconMap = {
    AiOutlineHome: AiOutlineHome,
    RiAiGenerate2: RiAiGenerate2,
    AiOutlineSearch: AiOutlineSearch,
    AiOutlineBook: AiOutlineBook,
    FaRegFile: FaRegFile,
    BellIcon: BellIcon,
    FiShield: FiShield,
    AiOutlineBarChart: AiOutlineBarChart
  };

  // Get filtered navigation items based on configuration
  const getNavigationItems = () => {
    const filteredItems = getFilteredNavigationItems();
    return filteredItems.map(item => {
      const IconComponent = iconMap[item.icon];
      if (!IconComponent) {
        console.error(`Icon not found for: ${item.icon}`);
        return { ...item, icon: AiOutlineHome }; // Fallback icon
      }
      return {
        ...item,
        icon: IconComponent
      };
    });
  };

  const navigationItems = getNavigationItems();
  
  // Debug logging
  console.log('Navigation items:', navigationItems);
  console.log('Filtered items from config:', getFilteredNavigationItems());

  const handleItemClick = (item, e) => {
    // Disable navigation on 404 pages
    if (is404Page) {
      e.preventDefault();
      return;
    }
    
    if (item.hasSubItems) {
      e.preventDefault(); // Prevent navigation
      onSubSidebarToggle(true);
    } else {
      onSubSidebarToggle(false);
    }
  };

  // Check if AI RCA should be active (when any sub-item is open)
  const isAIRCAActive =
    location.pathname.startsWith("/ai-rca-guidance") || 
    location.pathname === "/rca-dashboard";

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
                        is404Page
                          ? "text-gray-400 cursor-not-allowed opacity-50"
                          : isActive
                          ? "text-lime-500 border-l-4 border-lime-500 font-bold "
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
                    className={`flex items-center justify-center px-1 py-2 transition-colors duration-200 relative w-full ${
                      is404Page
                        ? "text-gray-400 cursor-not-allowed opacity-50"
                        : item.label === "AI RCA" && isAIRCAActive
                        ? "text-lime-500 border-l-4 border-lime-500 font-bold "
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
