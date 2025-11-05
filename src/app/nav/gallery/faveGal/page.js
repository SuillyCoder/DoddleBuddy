'use client';

import { useState, useEffect } from 'react';
import { auth, db } from '../../../../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, updateDoc, arrayRemove } from 'firebase/firestore';
import { fetchUserData } from '../../../../../lib/mockData';
import Link from 'next/link';

export default function FavoritesGallery() {
  const [user, setUser] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        const data = await fetchUserData(currentUser.uid);
        setImages(data?.favoritesGalleryPics || []);
      } else {
        // Guest mode - favorites not available
        setImages([]);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleRemoveFavorite = async (imageUrl) => {
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        favoritesGalleryPics: arrayRemove(imageUrl)
      });
      
      // Update local state
      setImages(images.filter(img => img !== imageUrl));
      alert('Removed from favorites');
    } catch (error) {
      console.error('Remove favorite error:', error);
      alert('Failed to remove from favorites');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <Link href="/nav/gallery" className="text-indigo-600 hover:text-indigo-700 mb-4 inline-block">
            ← Back to Galleries
          </Link>
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg mb-4">Sign in to access favorites</p>
            <Link href="/" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Go to Home →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <Link href="/nav/gallery" className="text-indigo-600 hover:text-indigo-700 mb-4 inline-block">
          ← Back to Galleries
        </Link>
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Favorites Gallery</h1>
          <p className="text-gray-600 mt-2">{images.length} favorite images</p>
        </div>
      </div>

      {/* Gallery Grid - 5 columns */}
      <div className="max-w-7xl mx-auto">
        {images.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg mb-4">No favorites yet</p>
            <p className="text-gray-400 mb-6">Star images from your galleries to add them here!</p>
            <Link href="/nav/gallery" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Go to Galleries →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {images.map((imageUrl, index) => (
              <div key={index} className="group relative aspect-square bg-gray-200 rounded-lg overflow-hidden">
                <img
                  src={imageUrl}
                  alt={`Favorite ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay with remove button */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => handleRemoveFavorite(imageUrl)}
                    className="p-2 bg-white rounded-full hover:bg-red-50 transition"
                    title="Remove from favorites"
                  >
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>

                {/* Star indicator */}
                <div className="absolute top-2 right-2 p-1 bg-yellow-500 rounded-full">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}