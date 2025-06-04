"use client";
import { usePathname } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

const LayoutWrapper = ({ children }: LayoutWrapperProps) => {
  const { isLoaded } = useUser();
  const pathname = usePathname();
  
  // Don't show loading on auth pages
  const isAuthPage = pathname?.startsWith('/auth');
  
  if (!isLoaded && !isAuthPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9f9f7]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default LayoutWrapper;