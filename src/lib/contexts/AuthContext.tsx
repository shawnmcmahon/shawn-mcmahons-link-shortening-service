"use client";

import React, { createContext, useEffect, useState } from "react";
import { 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider, 
  signOut as firebaseSignOut 
} from "firebase/auth";
import { User } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { signUpWithEmail, signInWithEmail } from "../firebase/firebaseUtils";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signUpWithEmail: async () => {},
  signInWithEmail: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    // Handle redirect result if user is returning from OAuth redirect
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          // User signed in via redirect
          setUser(result.user);
        }
      })
      .catch((error) => {
        console.error("Error getting redirect result", error);
      });

    return () => unsubscribe();
  }, []);

  const handleSignInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    
    // Add custom parameters for better compatibility
    provider.setCustomParameters({
      prompt: 'select_account'
    });

    try {
      // Try popup first (works better in dev/local)
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      // Check if it's a popup-blocked or popup-closed error
      const isPopupError = 
        error?.code === 'auth/popup-blocked' ||
        error?.code === 'auth/popup-closed-by-user' ||
        error?.code === 'auth/cancelled-popup-request' ||
        error?.message?.toLowerCase().includes('popup');

      if (isPopupError) {
        // Fallback to redirect for production/reliability
        console.log("Popup failed, falling back to redirect");
        try {
          await signInWithRedirect(auth, provider);
          // Note: signInWithRedirect doesn't return, it redirects the page
          // The redirect result will be handled in useEffect above
        } catch (redirectError: any) {
          console.error("Error with redirect sign-in", redirectError);
          throw new Error(
            redirectError?.message || 
            "Failed to sign in with Google. Please try again or check your browser settings."
          );
        }
      } else {
        // Re-throw other errors (invalid config, network, etc.)
        console.error("Error signing in with Google", error);
        throw new Error(
          error?.message || 
          "Failed to sign in with Google. Please check your configuration."
        );
      }
    }
  };

  const handleSignUpWithEmail = async (email: string, password: string) => {
    try {
      await signUpWithEmail(email, password);
    } catch (error) {
      console.error("Error signing up with email", error);
      throw error;
    }
  };

  const handleSignInWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmail(email, password);
    } catch (error) {
      console.error("Error signing in with email", error);
      throw error;
    }
  };

  const signOutUser = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle: handleSignInWithGoogle,
        signUpWithEmail: handleSignUpWithEmail,
        signInWithEmail: handleSignInWithEmail,
        signOut: signOutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };
