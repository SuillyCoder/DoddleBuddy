'use client';

import { useState, useEffect } from 'react';
import { auth } from '../../lib/firebase';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { googleProvider, db } from '../../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Initialize user document if it doesn't exist
        await initializeUserDocument(currentUser.uid, currentUser.email);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [mounted]);

  const initializeUserDocument = async (userId, userEmail) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        // Create new user document with empty arrays
        await setDoc(userRef, {
          userId: userId,
          email: userEmail,
          createdAt: new Date().toISOString(),
          referenceGalleryPics: [],
          artworkGalleryPics: [],
          favoritesGalleryPics: [],
          promptList: [],
        });
        console.log('✅ User document created');
      }
    } catch (error) {
      console.error('❌ Error initializing user document:', error);
    }
  };

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Sign-in error:', error);
      alert('Failed to sign in. Please try again.');
    } finally {
      setSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign-out error:', error);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-8">
      {/* App Title */}
      <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-12 tracking-tight">
        DOODLEBUDDY
      </h1>

      {/* Main Navigation Buttons */}
      <div className="w-full max-w-md space-y-4 mb-8">
        <a
          href="/nav/artists"
          className="block w-full"
        >
          <button className="w-full py-4 px-8 bg-blue-600 text-white text-xl font-semibold rounded-full hover:bg-blue-700 transition shadow-lg">
            ARTIST INSPO
          </button>
        </a>

        <a
          href="/nav/gallery"
          className="block w-full"
        >
          <button className="w-full py-4 px-8 bg-blue-600 text-white text-xl font-semibold rounded-full hover:bg-blue-700 transition shadow-lg">
            GALLERY
          </button>
        </a>

        <a
          href="/nav/prompts"
          className="block w-full"
        >
          <button className="w-full py-4 px-8 bg-blue-600 text-white text-xl font-semibold rounded-full hover:bg-blue-700 transition shadow-lg">
            PROMPTS
          </button>
        </a>

        <a
          href="/nav/dev"
          className="block w-full"
        >
          <button className="w-full py-4 px-8 bg-blue-600 text-white text-xl font-semibold rounded-full hover:bg-blue-700 transition shadow-lg">
            DEV SUPPORT
          </button>
        </a>
      </div>

      {/* Sign In Section */}
      <div className="w-full max-w-md mt-8">
        {user ? (
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-3 text-gray-700">
              <img 
                src={user.photoURL || '/default-avatar.png'} 
                alt="Profile"
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm font-medium">
                {user.displayName || user.email}
              </span>
            </div>
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={handleGoogleSignIn}
            disabled={signingIn}
            className="w-full flex items-center justify-center gap-3 py-3 px-6 bg-white border-2 border-gray-300 rounded-full hover:bg-gray-50 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="font-medium text-gray-700 text-lg">
              {signingIn ? 'Signing in...' : 'SIGN IN WITH GOOGLE'}
            </span>
          </button>
        )}
        
        {!user && (
          <p className="text-center text-sm text-gray-500 mt-4">
            💡 Sign in to save your galleries and prompts!
          </p>
        )}
      </div>
    </div>
  );
}