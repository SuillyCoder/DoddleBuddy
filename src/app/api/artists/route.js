import { NextResponse } from 'next/server';
import { getCurrentFeaturedArtist } from '../../../../lib/featuredArtists';

/**
 * ArtStation artists pool
 * These are curated artists from ArtStation with strong portfolios
 * The API will randomly select 3 each week
 */
const artstationArtistsPool = [
  {
    name: 'Bastien Grivet',
    artstationUrl: 'https://www.artstation.com/grivetart',
    imageUrl: 'https://picsum.photos/seed/bastien/600/600',
  },
  {
    name: 'Magdalena Pagowska',
    artstationUrl: 'https://www.artstation.com/len-yan',
    imageUrl: 'https://picsum.photos/seed/magdalena/600/600',
  },
  {
    name: 'Robbie Trevino',
    artstationUrl: 'https://www.artstation.com/robbietrevino',
    imageUrl: 'https://picsum.photos/seed/robbie/600/600',
  },
  {
    name: 'Atey Ghailan',
    artstationUrl: 'https://www.artstation.com/snatti',
    imageUrl: 'https://picsum.photos/seed/atey/600/600',
  },
  {
    name: 'Even Amundsen',
    artstationUrl: 'https://www.artstation.com/mischeviouslittleelf',
    imageUrl: 'https://picsum.photos/seed/even/600/600',
  },
  {
    name: 'Anna Podedworna',
    artstationUrl: 'https://www.artstation.com/akreon',
    imageUrl: 'https://picsum.photos/seed/anna/600/600',
  },
  {
    name: 'Ian McQue',
    artstationUrl: 'https://www.instagram.com/ianmcque/?hl=en',
    imageUrl: 'https://picsum.photos/seed/ian/600/600',
  },
  {
    name: 'Marta Nael',
    artstationUrl: 'https://www.artstation.com/martanael',
    imageUrl: 'https://picsum.photos/seed/marta/600/600',
  },
  {
    name: 'Gediminas Pranckevicius',
    artstationUrl: 'https://www.artstation.com/gedomenas',
    imageUrl: 'https://picsum.photos/seed/gediminas/600/600',
  },
  {
    name: 'Sergey Kolesov',
    artstationUrl: 'https://www.artstation.com/peleng',
    imageUrl: 'https://picsum.photos/seed/sergey/600/600',
  },
];

/**
 * Get a deterministic weekly seed based on the current week
 * This ensures the same 3 artists are shown for the entire week
 */
function getWeeklySeed() {
  const now = new Date();
  const year = now.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const days = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  
  return `${year}-W${weekNumber}`;
}

/**
 * Seeded random number generator
 * Ensures consistent "random" selection for the same week
 */
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Get 3 random ArtStation artists for this week
 */
function getWeeklyArtists() {
  const weekSeed = getWeeklySeed();
  
  // Convert week string to number for seeding
  const seedNumber = weekSeed.split('-W').reduce((acc, val) => acc + parseInt(val), 0);
  
  // Fisher-Yates shuffle with seeded random
  const shuffled = [...artstationArtistsPool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seedNumber + i) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  // Return first 3
  return shuffled.slice(0, 3);
}

/**
 * GET /api/artists
 * Returns 3 random ArtStation artists and the main featured artist
 */
export async function GET(request) {
  try {
    const artstationArtists = getWeeklyArtists();
    const mainArtist = getCurrentFeaturedArtist();
    
    return NextResponse.json({
      artstationArtists,
      mainArtist,
      weekSeed: getWeeklySeed(),
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch artists' },
      { status: 500 }
    );
  }
}