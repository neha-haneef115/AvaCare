"use client";
import { signIn, getProviders } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SignIn() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [providers, setProviders] = useState<any>(null);
  const [browserInfo, setBrowserInfo] = useState({
    isSecure: true,
    isInApp: false,
    browserName: '',
    recommendation: ''
  });

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

    // Enhanced browser detection
    const detectBrowser = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isHttps = window.location.protocol === 'https:';
      
      // Detect in-app browsers (these often cause issues with Google OAuth)
      const inAppBrowsers = [
        'instagram', 'facebook', 'twitter', 'linkedin', 'tiktok', 
        'snapchat', 'whatsapp', 'telegram', 'discord', 'slack',
        'wechat', 'line', 'kakaotalk', 'pinterest'
      ];
      
      const isInApp = inAppBrowsers.some(browser => userAgent.includes(browser));
      
      // Detect embedded webviews
      const isWebView = userAgent.includes('wv') || // Android WebView
                       userAgent.includes('version/') && userAgent.includes('chrome') && userAgent.includes('mobile');
      
      // Detect problematic environments
      const isProblematic = isInApp || isWebView || !isHttps;
      
      let browserName = 'Unknown';
      let recommendation = '';
      
      if (userAgent.includes('chrome')) browserName = 'Chrome';
      else if (userAgent.includes('safari') && !userAgent.includes('chrome')) browserName = 'Safari';
      else if (userAgent.includes('firefox')) browserName = 'Firefox';
      else if (userAgent.includes('edge')) browserName = 'Edge';
      
      if (isInApp) {
        recommendation = 'Please open this page in your default browser (Chrome, Safari, or Firefox) instead of the in-app browser.';
      } else if (isWebView) {
        recommendation = 'This appears to be an embedded browser. Please use your main browser app.';
      } else if (!isHttps) {
        recommendation = 'Please ensure you are accessing this page via HTTPS.';
      }
      
      setBrowserInfo({
        isSecure: !isProblematic,
        isInApp: isInApp || isWebView,
        browserName,
        recommendation
      });
    };

    detectBrowser();
  }, []);

  const handleSignIn = async (providerId: string) => {
    if (!browserInfo.isSecure) {
      // Show instructions instead of attempting sign-in
      return;
    }
    
    try {
      await signIn(providerId, { 
        callbackUrl: '/',
        redirect: true
      });
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const openInBrowser = () => {
    const currentUrl = window.location.href;
    
    // Try to open in default browser
    if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')) {
      // iOS - copy to clipboard and show instructions
      navigator.clipboard.writeText(currentUrl).then(() => {
        alert('URL copied to clipboard! Please paste it in Safari or your preferred browser.');
      }).catch(() => {
        alert(`Please copy this URL and open it in Safari: ${currentUrl}`);
      });
    } else {
      // Android or other - try to open in browser
      window.open(currentUrl, '_system');
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
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to AvaCare
          </h2>
          <p className="text-gray-600">
            Sign in to access your medical assistant
          </p>
        </div>

        {!browserInfo.isSecure && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Unsupported Browser Environment
                </h3>
                <p className="mt-2 text-sm text-red-700">
                  {browserInfo.recommendation}
                </p>
                <div className="mt-4">
                  <button
                    onClick={openInBrowser}
                    className="bg-red-100 hover:bg-red-200 text-red-800 font-medium py-2 px-4 rounded-lg text-sm transition-colors"
                  >
                    Open in Default Browser
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {browserInfo.isSecure ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Secure browser detected ({browserInfo.browserName})
              </div>
            </div>
            
            {providers && Object.values(providers).map((provider: any) => (
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
            ))}
          </div>
        ) : (
          <div className="bg-gray-100 p-6 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3">How to Access in a Secure Browser:</h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-start">
                <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</span>
                <span>Copy the current page URL</span>
              </div>
              <div className="flex items-start">
                <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</span>
                <span>Open your default browser (Chrome, Safari, Firefox)</span>
              </div>
              <div className="flex items-start">
                <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</span>
                <span>Paste the URL and navigate to this page</span>
              </div>
              <div className="flex items-start">
                <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">4</span>
                <span>Sign in using Google OAuth</span>
              </div>
            </div>
          </div>
        )}
        
        <div className="text-center text-sm text-gray-500">
          <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
}