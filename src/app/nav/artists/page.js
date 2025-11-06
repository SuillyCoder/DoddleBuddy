'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ArtistInspo() {
  const [artstationArtists, setArtstationArtists] = useState([]);
  const [mainArtist, setMainArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeUntilRefresh, setTimeUntilRefresh] = useState('');

  useEffect(() => {
    fetchArtists();
    updateCountdown();
    
    // Update countdown every second
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchArtists = async () => {
    try {
      const response = await fetch('/api/artists');
      const data = await response.json();
      
      setArtstationArtists(data.artstationArtists);
      setMainArtist(data.mainArtist);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching artists:', error);
      setLoading(false);
    }
  };

  const updateCountdown = () => {
    const now = new Date();
    const nextMonday = new Date(now);
    
    // Calculate next Monday
    const daysUntilMonday = (8 - now.getDay()) % 7 || 7;
    nextMonday.setDate(now.getDate() + daysUntilMonday);
    nextMonday.setHours(0, 0, 0, 0);
    
    const diff = nextMonday - now;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    parts.push(`${hours.toString().padStart(2, '0')}h`);
    parts.push(`${minutes.toString().padStart(2, '0')}m`);
    parts.push(`${seconds.toString().padStart(2, '0')}s`);
    
    setTimeUntilRefresh(parts.join(':'));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading artists...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-indigo-600 hover:text-indigo-700 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-5xl font-bold text-gray-900 text-center mb-2">
            ARTIST INSPO
          </h1>
          <p className="text-center text-gray-600">
            Refreshes in: <span className="font-mono font-semibold">{timeUntilRefresh}</span>
          </p>
        </div>

        {/* Top 3 ArtStation Artists */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {artstationArtists.map((artist, index) => (
            <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition">
              <div className="aspect-square w-full overflow-hidden bg-gradient-to-br from-blue-100 to-green-100">
                <img 
                  src={artist.imageUrl}
                  alt={`${artist.name}'s work`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3 text-center font-semibold text-2xl text-gray-900">
                  {artist.name}
              </div>
              <div className="p-3 text-center">
                <a
                  href={artist.artstationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition font-semibold text-sm"
                >
                  VIEW ON ARTSTATION
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Main Featured Artist */}
        {mainArtist && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              {/* Left: Large Image */}
              <div className="aspect-square md:aspect-auto bg-gradient-to-br from-blue-100 to-green-100">
                <img 
                  src={mainArtist.imageUrl}
                  alt={`${mainArtist.name}'s featured work`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Right: Bio and Profile Button */}
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <div className="p-6 text-center font-semibold text-5xl text-gray-900">
                  {mainArtist.name}
                </div>
                <p className="text-gray-700 text-lg text-justify leading-relaxed mb-8">
                  {mainArtist.bio}
                </p>
                <div className="text-center">
                  <a
                    href={mainArtist.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-8 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition font-semibold text-base"
                  >
                    VIEW PROFILE
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}