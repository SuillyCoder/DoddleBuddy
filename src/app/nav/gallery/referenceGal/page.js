'use client';

import { useState, useEffect } from 'react';
import { auth, storage, db } from '../../../../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { fetchUserData } from '../../../../../lib/mockData';
import Link from 'next/link';

export default function ReferenceGallery() {
  const [user, setUser] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        const data = await fetchUserData(currentUser.uid);
        setImages(data?.referenceGalleryPics || []);
      } else {
        // Guest mode - load from localStorage
        const guestImages = localStorage.getItem('guest_reference_gallery');
        setImages(guestImages ? JSON.parse(guestImages) : []);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);

    try {
      if (user) {
        // Authenticated user - upload to Firebase Storage
        const uploadPromises = files.map(async (file) => {
          const timestamp = Date.now();
          const fileName = `${user.uid}/reference/${timestamp}_${file.name}`;
          const storageRef = ref(storage, fileName);
          
          await uploadBytes(storageRef, file);
          const downloadURL = await getDownloadURL(storageRef);
          return downloadURL;
        });

        const uploadedURLs = await Promise.all(uploadPromises);
        
        // Update Firestore
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          referenceGalleryPics: arrayUnion(...uploadedURLs)
        });

        setImages([...images, ...uploadedURLs]);
        alert('Images uploaded successfully!');
      } else {
        // Guest mode - convert to base64 and store in localStorage
        const readPromises = files.map((file) => {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(file);
          });
        });

        const base64Images = await Promise.all(readPromises);
        const updatedImages = [...images, ...base64Images];
        
        setImages(updatedImages);
        localStorage.setItem('guest_reference_gallery', JSON.stringify(updatedImages));
        alert('Images saved locally (sign in to save permanently)');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFavorite = async (imageUrl) => {
    if (!user) {
      alert('Sign in to add favorites!');
      return;
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        favoritesGalleryPics: arrayUnion(imageUrl)
      });
      alert('Added to favorites!');
    } catch (error) {
      console.error('Favorite error:', error);
      alert('Failed to add to favorites');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading...</div>
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
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Reference Gallery</h1>
            <p className="text-gray-600 mt-2">{images.length} images</p>
          </div>
          
          {/* Upload Button */}
          <label className="cursor-pointer">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploading}
            />
            <div className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-50">
              {uploading ? 'Uploading...' : '+ Upload Images'}
            </div>
          </label>
        </div>
      </div>

      {/* Gallery Grid - 5 columns */}
      <div className="max-w-7xl mx-auto">
        {images.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg mb-4">No images yet</p>
            <p className="text-gray-400">Upload some reference images to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {images.map((imageUrl, index) => (
              <div key={index} className="group relative aspect-square bg-gray-200 rounded-lg overflow-hidden">
                <img
                  src={imageUrl}
                  alt={`Reference ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => handleFavorite(imageUrl)}
                    className="p-2 bg-white rounded-full hover:bg-gray-100 transition"
                    title="Add to favorites"
                  >
                    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}