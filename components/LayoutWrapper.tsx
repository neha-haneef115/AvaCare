"use client";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

const LayoutWrapper = ({ children }: LayoutWrapperProps) => {
  const { status } = useSession();
  const pathname = usePathname();
  
  // Don't show loading on auth pages
  const isAuthPage = pathname?.startsWith('/auth');
  
  if (status === "loading" && !isAuthPage) {
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