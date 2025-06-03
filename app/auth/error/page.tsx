"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Authentication Error
          </h2>
          <p className="text-gray-600 mb-4">
            {error === "Configuration" && "There is a problem with the server configuration."}
            {error === "AccessDenied" && "Access was denied."}
            {error === "Verification" && "The verification token has expired or is invalid."}
            {!error && "An unknown error occurred."}
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            href="/auth/signin"
            className="w-full flex justify-center items-center px-6 py-3 
                     bg-[#f5ff23] 
                     text-black font-bold rounded-lg 
                     border-2 border-black 
                     shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] 
                     hover:bg-[#E5Ef20] 
                     hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] 
                     hover:translate-x-[2px] hover:translate-y-[2px] 
                     transition-all"
          >
            Try Again
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AuthError() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}

export const dynamic = 'force-dynamic';