'use client';

import { useState } from 'react';

export default function PresetPromptsPage() {
  const [selectedTheme, setSelectedTheme] = useState('ANIME');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentThemeIndex, setCurrentThemeIndex] = useState(1);

  const themes = ['PIRATE', 'ANIME', 'SCI-FI', 'FANTASY', 'HORROR', 'NATURE'];

  const scrollThemes = (direction) => {
    if (direction === 'left') {
      setCurrentThemeIndex((prev) => (prev === 0 ? themes.length - 1 : prev - 1));
    } else {
      setCurrentThemeIndex((prev) => (prev === themes.length - 1 ? 0 : prev + 1));
    }
    setSelectedTheme(themes[currentThemeIndex]);
  };

  const generatePrompt = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/prompts/presetPrompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ theme: selectedTheme }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setGeneratedPrompt(data.prompt);
      } else {
        alert(data.error || 'Failed to generate prompt');
      }
    } catch (error) {
      console.error('Error generating prompt:', error);
      alert('Failed to generate prompt. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const visibleThemes = [
    themes[(currentThemeIndex - 1 + themes.length) % themes.length],
    themes[currentThemeIndex],
    themes[(currentThemeIndex + 1) % themes.length],
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            Preset Prompts
          </h1>
          <p className="text-gray-600">Choose a theme and generate instant inspiration</p>
        </div>

        {/* Reference Image Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          {/* Theme Carousel */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <button
              onClick={() => scrollThemes('left')}
              className="text-4xl font-bold text-gray-700 hover:text-blue-600 transition"
              aria-label="Previous theme"
            >
              &lt;
            </button>

            <div className="flex gap-4">
              {visibleThemes.map((theme, index) => (
                <button
                  key={theme}
                  onClick={() => {
                    setSelectedTheme(theme);
                    setCurrentThemeIndex(themes.indexOf(theme));
                  }}
                  className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
                    index === 1
                      ? 'bg-blue-600 text-white scale-110 shadow-lg'
                      : 'bg-blue-200 text-blue-800 scale-90 opacity-60'
                  }`}
                >
                  {theme}
                </button>
              ))}
            </div>

            <button
              onClick={() => scrollThemes('right')}
              className="text-4xl font-bold text-gray-700 hover:text-blue-600 transition"
              aria-label="Next theme"
            >
              &gt;
            </button>
          </div>

          {/* Generated Prompt Display */}
          <div className="bg-gray-50 rounded-xl p-8 mb-6 min-h-[200px] flex items-center justify-center">
            {isGenerating ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Generating your prompt...</p>
              </div>
            ) : generatedPrompt ? (
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-800 mb-2">GENERATED</p>
                <p className="text-xl text-gray-700 leading-relaxed">{generatedPrompt}</p>
              </div>
            ) : (
              <p className="text-gray-400 text-lg">Your generated prompt will appear here</p>
            )}
          </div>

          {/* Generate Button */}
          <button
            onClick={generatePrompt}
            disabled={isGenerating}
            className="w-full py-4 bg-blue-600 text-white text-xl font-semibold rounded-full hover:bg-blue-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? 'GENERATING...' : 'GENERATE PROMPT'}
          </button>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <a
            href="/nav/prompts"
            className="inline-block px-8 py-3 bg-gray-600 text-white font-semibold rounded-full hover:bg-gray-700 transition"
          >
            ← Back to Prompts
          </a>
        </div>
      </div>
    </div>
  );
}