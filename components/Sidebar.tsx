"use client"
import React, { useState, useEffect } from "react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from "next-auth/react";
import { useAutoAuth } from "@/hooks/useAutoAuth";
import { 
  Home, 
  MapPin, 
  FileText,
  MessageSquare, 
  LogOut,
  Menu,
  User,
  Loader2
} from "lucide-react";

const Sidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const { session, isLoading, isAuthenticated } = useAutoAuth();

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebarOnMobileNav = () => isMobile && setSidebarOpen(false);
  const isActive = (path: string) => pathname === path;

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const navigationItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/nearbydoc", icon: MapPin, label: "Nearby Doctors" },
    { href: "/Myreports", icon: FileText, label: "My Reports" },
    { href: "/contact", icon: MessageSquare, label: "Contact" },
  ];

  // Show loading state while authentication is being processed
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4" />
          <p className="text-gray-600">Authenticating...</p>
        </div>
      </div>
    );
  }

  // Don't render sidebar if not authenticated
  if (!isAuthenticated) {
    return null;
  }

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

        {/* User Info Section */}
        {sidebarOpen && session?.user && (
          <div className="px-4 pb-4">
            <div className="flex items-center space-x-3 p-3 bg-[#f8fed5] rounded-lg border-2 border-black">
              {session.user.image ? (
                <img 
                  src={session.user.image} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full border-2 border-black"
                />
              ) : (
                <User size={20} className="text-gray-600" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-black truncate">
                  {session.user.name}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {session.user.email}
                </p>
              </div>
            </div>
          </div>
        )}
  
        <nav className="p-4 space-y-3 h-[calc(100%-200px)] overflow-y-auto">
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
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center w-full px-4 py-3 
                     bg-[#f8fed5] text-black font-bold rounded-lg 
                     border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] 
                     hover:bg-[#ff6b6b] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] 
                     hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
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