"use client";
import { signIn, getProviders } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SignIn() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [providers, setProviders] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    
    if (session) {
      router.push('/');
    }
  }, [session, status, router]);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const res = await getProviders();
        console.log("Providers:", res);
        setProviders(res);
      } catch (err) {
        console.error("Error fetching providers:", err);
        setError("Failed to load authentication providers");
      }
    };
    fetchProviders();
  }, []);

  const handleSignIn = async (providerId: string) => {
    try {
      console.log("Attempting to sign in with:", providerId);
      const result = await signIn(providerId, { 
        callbackUrl: '/',
        redirect: false 
      });
      console.log("Sign in result:", result);
      
      if (result?.error) {
        setError(`Sign in failed: ${result.error}`);
      }
    } catch (err) {
      console.error("Sign in error:", err);
      setError("An unexpected error occurred during sign in");
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9f9f7]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (session) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to AvaCare
          </h2>
          <p className="text-gray-600">
            Sign in to access your medical assistant
          </p>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          {providers ? Object.values(providers).map((provider: any) => (
            <button
              key={provider.name}
              onClick={() => handleSignIn(provider.id)}
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
              Sign in with {provider.name}
            </button>
          )) : (
            <div className="text-center text-gray-500">
              Loading authentication providers...
            </div>
          )}
        </div>
        
        <div className="text-center text-sm text-gray-500">
          <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
        </div>

        {/* Debug info in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-100 rounded text-xs">
            <h3 className="font-bold mb-2">Debug Info:</h3>
            <p>Status: {status}</p>
            <p>Session: {session ? 'Authenticated' : 'Not authenticated'}</p>
            <p>Providers loaded: {providers ? 'Yes' : 'No'}</p>
          </div>
        )}
      </div>
    </div>
  );
}