'use client';

import { useState, useEffect } from 'react';
import { auth } from '../../../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { fetchUserData } from '../../../../lib/mockData';
import Link from 'next/link';

export default function GalleryNav() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        const data = await fetchUserData(currentUser.uid);
        setUserData(data);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  // Get preview images (first image from each gallery)
  const referencePreview = userData?.referenceGalleryPics?.[0] || 'https://via.placeholder.com/400x300?text=No+Images';
  const artworkPreview = userData?.artworkGalleryPics?.[0] || 'https://via.placeholder.com/400x300?text=No+Images';
  const favoritesPreview = userData?.favoritesGalleryPics?.[0] || 'https://via.placeholder.com/400x300?text=No+Favorites';

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <Link href="/" className="text-indigo-600 hover:text-indigo-700 mb-4 inline-block">
          ← Back to Home
        </Link>
        <h1 className="text-4xl font-bold text-gray-900">Your Galleries</h1>
        <p className="text-gray-600 mt-2">
          {user ? 'Manage your reference, artwork, and favorite images' : 'Sign in to save your galleries'}
        </p>
      </div>

      {/* Gallery Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Reference Gallery */}
        <Link href="/nav/gallery/referenceGal" className="group">
          <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
            <div className="aspect-video w-full overflow-hidden bg-gray-200">
              <img 
                src={referencePreview}
                alt="Reference Gallery Preview"
                className="w-full h-full object-cover group-hover:scale-105 transition"
              />
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Reference Gallery</h2>
              <p className="text-gray-600 text-sm mb-3">
                Store reference images for inspiration and study
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {userData?.referenceGalleryPics?.length || 0} images
                </span>
                <span className="text-indigo-600 group-hover:text-indigo-700 font-medium">
                  View Gallery →
                </span>
              </div>
            </div>
          </div>
        </Link>

        {/* Artwork Gallery */}
        <Link href="/nav/gallery/artworkGal" className="group">
          <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
            <div className="aspect-video w-full overflow-hidden bg-gray-200">
              <img 
                src={artworkPreview}
                alt="Artwork Gallery Preview"
                className="w-full h-full object-cover group-hover:scale-105 transition"
              />
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Artwork Gallery</h2>
              <p className="text-gray-600 text-sm mb-3">
                Showcase your completed artworks and creations
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {userData?.artworkGalleryPics?.length || 0} images
                </span>
                <span className="text-indigo-600 group-hover:text-indigo-700 font-medium">
                  View Gallery →
                </span>
              </div>
            </div>
          </div>
        </Link>

        {/* Favorites Gallery */}
        <Link href="/nav/gallery/faveGal" className="group">
          <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
            <div className="aspect-video w-full overflow-hidden bg-gray-200">
              <img 
                src={favoritesPreview}
                alt="Favorites Gallery Preview"
                className="w-full h-full object-cover group-hover:scale-105 transition"
              />
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Favorites Gallery</h2>
              <p className="text-gray-600 text-sm mb-3">
                Your favorite images from all galleries
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {userData?.favoritesGalleryPics?.length || 0} images
                </span>
                <span className="text-indigo-600 group-hover:text-indigo-700 font-medium">
                  View Gallery →
                </span>
              </div>
            </div>
          </div>
        </Link>

      </div>
    </div>
  );
}