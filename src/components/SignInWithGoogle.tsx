"use client";

import { useState } from 'react';
import { useAuth } from '../lib/hooks/useAuth';

export default function SignInWithGoogle() {
  const { signInWithGoogle } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setError(null);
    setLoading(true);
    
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error("Sign in error:", err);
      
      // Provide user-friendly error messages
      let errorMessage = "Failed to sign in with Google. Please try again.";
      
      if (err?.message) {
        if (err.message.includes("popup")) {
          errorMessage = "Popup was blocked. Please allow popups and try again, or the page will redirect automatically.";
        } else if (err.message.includes("unauthorized")) {
          errorMessage = "This domain is not authorized. Please contact support.";
        } else if (err.message.includes("network")) {
          errorMessage = "Network error. Please check your connection and try again.";
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <button
        onClick={handleSignIn}
        disabled={loading}
        className="w-full flex items-center justify-center bg-white text-gray-700 font-semibold py-2 px-4 rounded-full border border-gray-300 hover:bg-gray-100 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700 mr-2"></div>
            Signing in...
          </>
        ) : (
          <>
            <img 
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
              alt="Google logo" 
              width={24}
              height={24}
              className="mr-2" 
            />
            Sign in with Google
          </>
        )}
      </button>
      {error && (
        <div className="mt-2 text-sm text-red-600 text-center">
          {error}
        </div>
      )}
    </div>
  );
}
