"use client";
import { signIn, getProviders } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SignIn() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [providers, setProviders] = useState<any>(null);

  useEffect(() => {
    if (status === "loading") return;
    
    if (session) {
      router.push('/');
    }
  }, [session, status, router]);

  useEffect(() => {
    const fetchProviders = async () => {
      const res = await getProviders();
      setProviders(res);
    };
    fetchProviders();
  }, []);

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
        
        <div className="space-y-4">
          {providers && Object.values(providers).map((provider: any) => (
            <button
              key={provider.name}
              onClick={() => signIn(provider.id, { callbackUrl: '/' })}
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
          ))}
        </div>
        
        <div className="text-center text-sm text-gray-500">
          <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
}