"use client"
import React, { useState, useEffect } from "react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  MapPin, 
  FileText,
  MessageSquare, 
  LogOut,
  Menu,
} from "lucide-react";

const Sidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebarOnMobileNav = () => isMobile && setSidebarOpen(false);
  const isActive = (path: string) => pathname === path;

  const navigationItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/nearbydoc", icon: MapPin, label: "Nearby Doctors" },
    { href: "/Myreports", icon: FileText, label: "My Reports" },
    { href: "/contact", icon: MessageSquare, label: "Contact" },
  ];

  return (
    <>
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setSidebarOpen(false)} />
      )}

      <div className={`
        fixed md:relative inset-y-0 left-0 z-50 bg-white border-r-2 border-black 
        transition-all duration-300 ease-in-out h-screen
        ${isMobile ? 'w-64' : sidebarOpen ? 'w-64' : 'w-20'}
        ${isMobile ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
      `}>
        <div className="p-4 bg-white flex justify-between items-center">
          <button
            onClick={toggleSidebar}
            className="p-2 bg-[#f8fed5] text-black font-bold rounded-lg 
                     border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] 
                     hover:bg-[#e0f081] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] 
                     hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            <Menu size={18} />
          </button>
        </div>
  
        <nav className="p-4 space-y-3 h-[calc(100%-150px)] overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} passHref>
                <button 
                  className={`flex items-center w-full px-4 py-3 my-4
                           text-black font-bold rounded-lg 
                           border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] 
                           hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] 
                           hover:translate-x-[2px] hover:translate-y-[2px] transition-all
                           ${isActive(item.href) ? 'bg-[#e0f081]' : 'bg-[#f8fed5] hover:bg-[#e0f081]'}`}
                  onClick={closeSidebarOnMobileNav}
                >
                  <Icon className={`${sidebarOpen ? 'mr-3' : 'mx-auto'}`} size={18} />
                  {sidebarOpen && item.label}
                </button>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <button className="flex items-center justify-center w-full px-4 py-3 
                           bg-[#f8fed5] text-black font-bold rounded-lg 
                           border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] 
                           hover:bg-[#ff6b6b] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] 
                           hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
            <LogOut className={`${sidebarOpen ? 'mr-3' : 'mx-auto'}`} size={18} />
            {sidebarOpen && "Logout"}
          </button>
        </div>
      </div>

      {isMobile && !sidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-2 bg-[#f8fed5] text-black font-bold rounded-lg 
                   border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] 
                   hover:bg-[#e0f081] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] 
                   hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
        >
          <Menu size={18} />
        </button>
      )}
    </>
  );
};

export default Sidebar;