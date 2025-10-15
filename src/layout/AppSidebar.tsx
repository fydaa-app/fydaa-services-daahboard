"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { deleteCookie } from "cookies-next";
import { useSidebar } from "../context/SidebarContext";
import {
  GridIcon,
  PieChartIcon,
  TableIcon,
  UserCircleIcon,
  LeaderboardIcon,
  SettingIcon,
  ShoppingCartIcon,
  CheckCircleIcon,
  MoneyIcon, 
  StockIcon, 
  FundIcon, 
} from "../icons/index";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/",
  },
  {
    icon: <UserCircleIcon />,
    name: "Users",
    path: "/userlist",
    subItems: [
      { name: "All Users", path: "/userlist" },
      { name: "Fydaa Users", path: "/fydaauserlist" },
      { name: "Savestment Users", path: "/savestmentuserlist" },
    ]
  },
  {
    icon: <MoneyIcon />,
    name: "Payments",
    path: "/payment-list",
  },
  {
    icon: <TableIcon />,
    name: "Account Ledger",
    path: "/account-ledger",
  },
  {
    icon: <CheckCircleIcon />,
    name: "Payment Approval",
    path: "/payment-approval",
  },
  {
    icon: <LeaderboardIcon />,
    name: "Goals",
    path: "/goal",
  },
  {
    icon: <ShoppingCartIcon />,
    name: "Packages",
    path: "/packages",
  },
  {
    icon: <ShoppingCartIcon />,
    name: "Services",
    path: "/package-service",
  },
  {
    icon: <StockIcon />,
    name: "Stocks",
    path: "/stock",
  },
  {
    icon: <StockIcon />,
    name: "Recommended Stocks",
    path: "/recommended-stock",
  },
  {
    icon: <PieChartIcon />,
    name: "Portfolio",
    path: "/portfolio",
  },  
  {
    icon: <FundIcon />,
    name: "My Mutual Fund",
    path: "/my-mutual-fund",
  }, 
  {
    icon: <FundIcon />,
    name: "Mutual Fund",
    path: "/mutual-fund",
  },   
  {
    name: "Settings",
    icon: <SettingIcon />,
    path: "/settings",
  },
  {
    name: "Sign Out",
    icon: (
      <svg
        className="w-5 h-5"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M15.1007 19.247C14.6865 19.247 14.3507 18.9112 14.3507 18.497L14.3507 14.245H12.8507V18.497C12.8507 19.7396 13.8581 20.747 15.1007 20.747H18.5007C19.7434 20.747 20.7507 19.7396 20.7507 18.497L20.7507 5.49609C20.7507 4.25345 19.7433 3.24609 18.5007 3.24609H15.1007C13.8581 3.24609 12.8507 4.25345 12.8507 5.49609V9.74501L14.3507 9.74501V5.49609C14.3507 5.08188 14.6865 4.74609 15.1007 4.74609L18.5007 4.74609C18.9149 4.74609 19.2507 5.08188 19.2507 5.49609L19.2507 18.497C19.2507 18.9112 18.9149 19.247 18.5007 19.247H15.1007ZM3.25073 11.9984C3.25073 12.2144 3.34204 12.4091 3.48817 12.546L8.09483 17.1556C8.38763 17.4485 8.86251 17.4487 9.15549 17.1559C9.44848 16.8631 9.44863 16.3882 9.15583 16.0952L5.81116 12.7484L16.0007 12.7484C16.4149 12.7484 16.7507 12.4127 16.7507 11.9984C16.7507 11.5842 16.4149 11.2484 16.0007 11.2484L5.81528 11.2484L9.15585 7.90554C9.44864 7.61255 9.44847 7.13767 9.15547 6.84488C8.86248 6.55209 8.3876 6.55226 8.09481 6.84525L3.52309 11.4202C3.35673 11.5577 3.25073 11.7657 3.25073 11.9984Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

  const handleSignOut = () => {
    deleteCookie("authToken");
    deleteCookie("employeeData");
    router.push("/signin");
  };

  const toggleSubMenu = (navName: string) => {
    setOpenSubMenu(openSubMenu === navName ? null : navName);
  };

  const isActive = (path: string) => pathname === path;
  const hasActiveSubItem = (subItems?: { path: string }[]) => 
    subItems?.some(item => pathname === item.path);

  const renderMenuItems = (navItems: NavItem[]) => (
    <ul className="flex flex-col gap-1.5">
      {navItems.map((nav) => {
        const isItemActive = nav.path ? isActive(nav.path) : false;
        const hasActiveSub = hasActiveSubItem(nav.subItems);
        const showText = isExpanded || isHovered || isMobileOpen;

        return (
          <li key={nav.name} className="relative">
            {nav.name === "Sign Out" ? (
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 dark:hover:from-red-900/10 dark:hover:to-rose-900/10 transition-all duration-200 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10 flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                  {nav.icon}
                </span>
                {showText && (
                  <span className="relative z-10 font-medium text-sm whitespace-nowrap transition-all duration-200">
                    {nav.name}
                  </span>
                )}
              </button>
            ) : nav.subItems ? (
              <div>
                <button
                  onClick={() => toggleSubMenu(nav.name)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                    hasActiveSub
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/10 dark:hover:to-indigo-900/10"
                  }`}
                >
                  {!hasActiveSub && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}
                  <span className={`relative z-10 flex-shrink-0 transition-transform duration-200 ${hasActiveSub ? '' : 'group-hover:scale-110'}`}>
                    {nav.icon}
                  </span>
                  {showText && (
                    <>
                      <span className="relative z-10 font-medium text-sm whitespace-nowrap flex-1 text-left transition-all duration-200">
                        {nav.name}
                      </span>
                      <svg
                        className={`w-4 h-4 transition-transform duration-300 ${openSubMenu === nav.name ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </>
                  )}
                </button>
                {showText && openSubMenu === nav.name && (
                  <div className="ml-4 mt-1.5 space-y-1 animate-in slide-in-from-top-2 duration-200">
                    {nav.subItems.map((subItem) => (
                      <Link
                        key={subItem.path}
                        href={subItem.path}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                          isActive(subItem.path)
                            ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20"
                            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                        <span className="font-medium">{subItem.name}</span>
                        {subItem.new && (
                          <span className="ml-auto px-2 py-0.5 text-xs font-semibold bg-green-500 text-white rounded-full">
                            New
                          </span>
                        )}
                        {subItem.pro && (
                          <span className="ml-auto px-2 py-0.5 text-xs font-semibold bg-purple-500 text-white rounded-full">
                            Pro
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              nav.path && (
                <Link
                  href={nav.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                    isItemActive
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/10 dark:hover:to-indigo-900/10"
                  }`}
                >
                  {!isItemActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}
                  {isItemActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 animate-pulse" />
                  )}
                  <span className={`relative z-10 flex-shrink-0 transition-transform duration-200 ${isItemActive ? '' : 'group-hover:scale-110'}`}>
                    {nav.icon}
                  </span>
                  {showText && (
                    <span className="relative z-10 font-medium text-sm whitespace-nowrap transition-all duration-200">
                      {nav.name}
                    </span>
                  )}
                  {isItemActive && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-full" />
                  )}
                </Link>
              )
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 left-0 bg-white dark:bg-gray-900 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 shadow-xl dark:shadow-gray-950/50
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
        before:absolute before:inset-y-0 before:right-0 before:w-px before:bg-gradient-to-b before:from-transparent before:via-gray-200 dark:before:via-gray-800 before:to-transparent`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo Section */}
      <div className="py-8 px-5 flex items-center border-b border-gray-100 dark:border-gray-800">
        <Link href="/" className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg blur opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
          <Image
            src="/images/logo/logo2.png"
            alt="Logo"
            width={150}
            height={40}
            className="relative z-10"
          />
        </Link>
      </div>

      {/* Navigation Section */}
      <div className="flex-1 flex flex-col overflow-y-auto px-3 py-4 custom-scrollbar">
        <nav className="flex-1">{renderMenuItems(navItems)}</nav>
        
        {/* Bottom Gradient Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white dark:from-gray-900 to-transparent pointer-events-none" />
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #6366f1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #4f46e5);
        }
        
        @keyframes slide-in-from-top-2 {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-in {
          animation-duration: 200ms;
        }
        
        .slide-in-from-top-2 {
          animation-name: slide-in-from-top-2;
        }
      `}</style>
    </aside>
  );
};

export default AppSidebar;