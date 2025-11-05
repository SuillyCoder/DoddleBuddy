import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Creates initial mock data for a new user
 */
export const createMockUserData = async (userId, userEmail) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    // Check if user document already exists
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      // Create new user document with mock data
      const mockUserData = {
        userId: userId,
        email: userEmail,
        createdAt: new Date().toISOString(),
        
        // Reference Gallery - Mock image URLs
        referenceGalleryPics: [
          'https://picsum.photos/seed/ref1/800/600',
          'https://picsum.photos/seed/ref2/800/600',
          'https://picsum.photos/seed/ref3/800/600',
        ],
        
        // Artwork Gallery - Mock image URLs
        artworkGalleryPics: [
          'https://picsum.photos/seed/art1/800/600',
          'https://picsum.photos/seed/art2/800/600',
        ],
        
        // Favorites Gallery - Mock image URLs
        favoritesGalleryPics: [
          'https://picsum.photos/seed/fav1/800/600',
        ],
        
        // Prompt List - Mock prompts
        promptList: [
          {
            timeCreated: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            promptThread: 'Draw a mystical forest with glowing mushrooms and fireflies',
            type: 'fantasy',
          },
          {
            timeCreated: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            promptThread: 'Design a futuristic cyberpunk city street at night',
            type: 'sci-fi',
          },
          {
            timeCreated: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
            promptThread: 'Illustrate a pirate ship sailing through stormy seas',
            type: 'pirate',
          },
        ],
      };
      
      await setDoc(userRef, mockUserData);
      console.log('✅ Mock user data created successfully');
      return mockUserData;
    } else {
      console.log('ℹ️ User data already exists, skipping mock data creation');
      return userSnap.data();
    }
  } catch (error) {
    console.error('❌ Error creating mock user data:', error);
    throw error;
  }
};

/**
 * Fetches user data from Firestore
 */
export const fetchUserData = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data();
    } else {
      console.log('No user data found');
      return null;
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};

/**
 * Migrates guest data from localStorage to Firestore
 */
export const migrateGuestDataToFirestore = async (userId) => {
  try {
    const guestReferenceGallery = localStorage.getItem('guest_reference_gallery');
    const guestArtworkGallery = localStorage.getItem('guest_artwork_gallery');
    const guestPrompts = localStorage.getItem('guest_prompts');
    
    if (!guestReferenceGallery && !guestArtworkGallery && !guestPrompts) {
      console.log('No guest data to migrate');
      return;
    }
    
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const existingData = userSnap.data();
      
      // Merge guest data with existing data
      const updatedData = {
        ...existingData,
        referenceGalleryPics: [
          ...(existingData.referenceGalleryPics || []),
          ...(guestReferenceGallery ? JSON.parse(guestReferenceGallery) : []),
        ],
        artworkGalleryPics: [
          ...(existingData.artworkGalleryPics || []),
          ...(guestArtworkGallery ? JSON.parse(guestArtworkGallery) : []),
        ],
        promptList: [
          ...(existingData.promptList || []),
          ...(guestPrompts ? JSON.parse(guestPrompts) : []),
        ],
      };
      
      await setDoc(userRef, updatedData, { merge: true });
      
      // Clear localStorage after successful migration
      localStorage.removeItem('guest_reference_gallery');
      localStorage.removeItem('guest_artwork_gallery');
      localStorage.removeItem('guest_prompts');
      
      console.log('✅ Guest data migrated successfully');
    }
  } catch (error) {
    console.error('❌ Error migrating guest data:', error);
  }
};

/**
 * Creates mock featured artists (for admin/testing use)
 */
export const createMockArtists = async () => {
  try {
    const artists = [
      {
        name: 'Sakura Tanaka',
        bio: 'Digital illustrator specializing in anime and character design. Based in Tokyo with 10+ years of experience.',
        profileUrl: 'https://picsum.photos/seed/artist1/400/400',
        url: 'https://example.com/sakura',
      },
      {
        name: 'Marcus Chen',
        bio: 'Concept artist for video games and films. Known for breathtaking environment and landscape art.',
        profileUrl: 'https://picsum.photos/seed/artist2/400/400',
        url: 'https://example.com/marcus',
      },
      {
        name: 'Elena Rodriguez',
        bio: 'Fantasy illustrator and cover artist. Creates stunning book covers and editorial illustrations.',
        profileUrl: 'https://picsum.photos/seed/artist3/400/400',
        url: 'https://example.com/elena',
      },
    ];
    
    // Store artists in Firestore
    for (let i = 0; i < artists.length; i++) {
      const artistRef = doc(db, 'artists', `artist_${i + 1}`);
      await setDoc(artistRef, artists[i]);
    }
    
    console.log('✅ Mock artists created successfully');
  } catch (error) {
    console.error('❌ Error creating mock artists:', error);
  }
};