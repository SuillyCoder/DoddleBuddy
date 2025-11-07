'use client';

import { useState, useEffect } from 'react';
import { auth, db } from '../../../../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { fetchUserData } from '../../../../../lib/mockData';
import { uploadToCloudinary } from '../../../../../lib/cloudinaryUpload';
import Link from 'next/link';

export default function ReferenceGallery() {
  const [user, setUser] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [previewImage, setPreviewImage] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        const data = await fetchUserData(currentUser.uid);
        setImages(data?.referenceGalleryPics || []);
      } else {
        const guestImages = sessionStorage.getItem('guest_reference_gallery');
        setImages(guestImages ? JSON.parse(guestImages) : []);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user && images.length > 0) {
      sessionStorage.setItem('guest_reference_gallery', JSON.stringify(images));
    }
  }, [images, user]);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress({ current: 0, total: files.length });

    try {
      if (user) {
        const uploadedURLs = [];
        
        const batchSize = 3;
        for (let i = 0; i < files.length; i += batchSize) {
          const batch = files.slice(i, i + batchSize);
          
          const batchPromises = batch.map(async (file) => {
            try {
              const imageUrl = await uploadToCloudinary(file, 'reference', user.uid);
              setUploadProgress(prev => ({ ...prev, current: prev.current + 1 }));
              return imageUrl;
            } catch (error) {
              console.error(`Failed to upload ${file.name}:`, error);
              return null;
            }
          });

          const batchResults = await Promise.all(batchPromises);
          uploadedURLs.push(...batchResults.filter(url => url !== null));
        }
        
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          referenceGalleryPics: arrayUnion(...uploadedURLs)
        });

        setImages([...images, ...uploadedURLs]);
        alert(`${uploadedURLs.length} image(s) uploaded successfully!`);
      } else {
        const objectURLs = files.map(file => URL.createObjectURL(file));
        const updatedImages = [...images, ...objectURLs];
        setImages(updatedImages);
        sessionStorage.setItem('guest_reference_gallery', JSON.stringify(updatedImages));
        alert(`${files.length} image(s) added! (Sign in to save permanently)`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload some images. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress({ current: 0, total: 0 });
      e.target.value = '';
    }
  };

  const handleDeleteImage = async (imageUrl, index) => {
    try {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          referenceGalleryPics: arrayRemove(imageUrl)
        });

        setImages(images.filter((_, i) => i !== index));
        alert('Image deleted successfully!');
      } else {
        const updatedImages = images.filter((_, i) => i !== index);
        setImages(updatedImages);
        sessionStorage.setItem('guest_reference_gallery', JSON.stringify(updatedImages));
        URL.revokeObjectURL(imageUrl);
        alert('Image removed!');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete image');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleFavorite = async (imageUrl) => {
    if (!user) {
      alert('Sign in to add favorites!');
      return;
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      const currentFavorites = userDoc.data()?.favoritesGalleryPics || [];
      
      if (currentFavorites.includes(imageUrl)) {
        alert('Already in favorites!');
        return;
      }
      
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
      <div className="max-w-7xl mx-auto mb-8">
        <Link href="/nav/gallery" className="text-indigo-600 hover:text-indigo-700 mb-4 inline-block">
          ← Back to Galleries
        </Link>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Reference Gallery</h1>
            <p className="text-gray-600 mt-2">{images.length} images</p>
            {!user && (
              <p className="text-amber-600 text-sm mt-1">
                ⚠️ Guest mode: Images saved until refresh. Sign in for permanent storage!
              </p>
            )}
          </div>
          
          <label className="cursor-pointer">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploading}
            />
            <div className={`px-6 py-3 rounded-lg transition font-medium ${
              uploading 
                ? 'bg-gray-400 text-white cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}>
              {uploading 
                ? `Uploading ${uploadProgress.current}/${uploadProgress.total}...` 
                : '+ Upload Images'}
            </div>
          </label>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {images.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg mb-4">No images yet</p>
            <p className="text-gray-400">Upload some reference images to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {images.map((imageUrl, index) => (
              <div 
                key={index} 
                className="group relative aspect-square bg-gray-200 rounded-lg overflow-hidden cursor-pointer"
                onClick={() => setPreviewImage(imageUrl)}
              >
                <img
                  src={imageUrl}
                  alt={`Reference ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFavorite(imageUrl);
                    }}
                    className="p-2 bg-white rounded-full hover:bg-gray-100 transition"
                    title="Add to favorites"
                  >
                    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirm({ url: imageUrl, index });
                    }}
                    className="p-2 bg-white rounded-full hover:bg-red-50 transition"
                    title="Delete image"
                  >
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {previewImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={previewImage}
            alt="Preview"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Image?</h3>
            <p className="text-gray-600 mb-6">
              This action cannot be undone. Are you sure you want to delete this image?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteImage(deleteConfirm.url, deleteConfirm.index)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}