"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, Users, Clock, Zap, Network, Shield } from "lucide-react";
import Image from "next/image";
import { apiFetch } from "@/lib/apiClient";

interface SliderImage {
  _id: string;
  title: string;
  description?: string;
  imageUrl: string;
  order: number;
}

interface ImageSliderProps {
  readonly className?: string;
  readonly autoPlay?: boolean;
  readonly interval?: number;
  readonly showControls?: boolean;
  readonly showIndicators?: boolean;
  readonly externalUpdate?: number; // Trigger to show success message
}

export default function ImageSlider({
  className = "",
  autoPlay = true,
  interval = 5000,
  showControls = true,
  showIndicators = true,
  externalUpdate,
}: ImageSliderProps) {
  const [slides, setSlides] = useState<SliderImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [error, setError] = useState<string | null>(null);

  // Fetch slides from API
  useEffect(() => {
    async function fetchSlides() {
      try {
        const res = await apiFetch("/api/sliders");
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error ?? "Failed to fetch slides");
        setSlides(data.sliders || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load slides");
      } finally {
        setIsLoading(false);
      }
    }

    fetchSlides();
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || slides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, interval);

    return () => clearInterval(timer);
  }, [isPlaying, interval, slides.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? slides.length - 1 : prevIndex - 1
    );
  }, [slides.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  }, [slides.length]);

  const togglePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  if (isLoading) {
    return (
      <div className={`relative w-full h-full bg-gray-200 animate-pulse ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-700">Loading slides... ({slides.length} found)</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`relative w-full h-full bg-gray-200 ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-red-500 text-center px-4">
            <div className="font-semibold">Error loading slides</div>
            <div className="text-sm mt-1">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className={`relative w-full h-full overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 ${className}`}>

        {/* PURE BLUE OVERLAY (NO DARK) */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-700/40 via-blue-600/20 to-transparent" />

        {/* Decorative blue glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-[28rem] h-[28rem] bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-2xl" />

        <div className="relative z-10 flex items-center justify-center h-full px-6">
          <div className="text-center max-w-4xl">

            {/* Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white mb-4 sm:mb-6 leading-tight tracking-tight">
              <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                Build Smarter Networks. Scale Without Limits.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-blue-100 text-sm sm:text-base md:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed font-normal px-2 sm:px-0">
              A modern infrastructure platform designed for scalable growth,
              real-time performance tracking, and automated distribution.
            </p>

            {/* Trust indicators */}
            <div className="mt-6 sm:mt-10 flex flex-wrap justify-center gap-6 sm:gap-12">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-blue-500/20 rounded-xl border border-white/20">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-100" />
                </div>
                <div>
                  <div className="text-lg sm:text-2xl font-bold text-white">10,000+</div>
                  <div className="text-xs sm:text-sm text-blue-200">Active Users</div>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-blue-500/20 rounded-xl border border-white/20">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-100" />
                </div>
                <div>
                  <div className="text-lg sm:text-2xl font-bold text-white">24/7</div>
                  <div className="text-xs sm:text-sm text-blue-200">Dedicated Support</div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-8 sm:mt-12 lg:mt-16 flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 px-4 sm:px-0">
              <a
                href="/register"
                className="px-6 sm:px-8 lg:px-10 py-3 sm:py-4 rounded-xl bg-white text-blue-600 font-semibold text-base sm:text-lg
                          hover:bg-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                Create Account
              </a>

              <a
                href="/login"
                className="px-6 sm:px-8 lg:px-10 py-3 sm:py-4 rounded-xl border border-white/40 text-white font-semibold text-base sm:text-lg
                          hover:border-white/70 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1"
              >
                Sign In
              </a>
            </div>

          </div>
        </div>
      </div>
    );
  }

  const currentSlide = slides[currentIndex];

  // Debug: Check if we have slides and current slide
  if (slides.length > 0) {
    console.log('Sliders found:', slides.length, 'Current slide:', currentSlide);
  }

  // Check if image URL is valid (not a redirect or invalid URL)
  const isValidImageUrl = (url: string) => {
    if (!url) return false;
    // Allow data URLs (uploaded images)
    if (url.startsWith('data:')) return true;
    // Allow common image hosting domains
    const validDomains = ['unsplash.com', 'picsum.photos', 'pexels.com', 'pixabay.com', 'imgur.com', 'placeholder.com'];
    try {
      const urlObj = new URL(url);
      return validDomains.some(domain => urlObj.hostname.includes(domain)) || url.startsWith('/');
    } catch {
      return false;
    }
  };

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* Main slide image */}
      <div className="relative w-full h-full bg-black">
        {isValidImageUrl(currentSlide.imageUrl) ? (
          <Image
            src={currentSlide.imageUrl}
            alt={currentSlide.title}
            fill
            className="object-cover"
            sizes="100vw"
            priority={currentIndex === 0}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400' viewBox='0 0 800 400'%3E%3Crect width='800' height='400' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%236b7280' font-family='sans-serif' font-size='24'%3EImage not available%3C/text%3E%3C/svg%3E";
            }}
            unoptimized={currentSlide.imageUrl.startsWith('data:')}
            style={{
              objectPosition: 'center',
              padding: '0'
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🖼️</div>
              <div className="text-gray-600">
                <div className="font-semibold">Invalid Image URL</div>
                <div className="text-sm mt-1">Please update the slider with a valid image</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/40" />
        
        {/* Hero section overlay with features */}
        <div className="absolute inset-0 flex items-center justify-center z-20 w-full">
          <div className="relative z-10 flex flex-col items-center justify-center w-full min-h-full px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-10 md:py-12">
            <div className="text-center max-w-4xl space-y-2 sm:space-y-3 md:space-y-4">
              {/* Heading */}
              <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white leading-tight tracking-tight">
                <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                  Build Smarter Networks. Scale Without Limits.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-blue-100 text-xs sm:text-sm md:text-base lg:text-lg max-w-3xl mx-auto leading-relaxed font-normal">
                A modern infrastructure platform designed for scalable growth,
                real-time performance tracking, and automated distribution.
              </p>

              {/* Trust indicators */}
              <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-blue-500/30 rounded-lg border border-white/30 backdrop-blur-sm">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-100" />
                  </div>
                  <div>
                    <div className="text-sm sm:text-base md:text-lg font-bold text-white">10,000+</div>
                    <div className="text-xs text-blue-200">Active Users</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-blue-500/30 rounded-lg border border-white/30 backdrop-blur-sm">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-100" />
                  </div>
                  <div>
                    <div className="text-sm sm:text-base md:text-lg font-bold text-white">24/7</div>
                    <div className="text-xs text-blue-200">Dedicated Support</div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 md:gap-5">
                <a
                  href="/register"
                  className="px-6 sm:px-7 md:px-8 py-2.5 sm:py-3 rounded-lg bg-blue-600 text-white font-semibold text-sm sm:text-base
                            hover:bg-blue-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                >
                  Create Account
                </a>

                <a
                  href="/login"
                  className="px-6 sm:px-7 md:px-8 py-2.5 sm:py-3 rounded-lg border border-white/40 text-white font-semibold text-sm sm:text-base
                            hover:border-white/70 hover:bg-white/10 transition-all duration-300 hover:-translate-y-0.5"
                >
                  Sign In
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation controls */}
      {showControls && slides.length > 1 && (
        <>
          {/* Previous button */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-sm text-white p-3 rounded-full hover:bg-black/70 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 z-10"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Next button */}
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-sm text-white p-3 rounded-full hover:bg-black/70 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 z-10"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Play/Pause button */}
          <button
            onClick={togglePlayPause}
            className="absolute right-4 bottom-4 bg-black/50 backdrop-blur-sm text-white p-3 rounded-full hover:bg-black/70 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 z-10"
            aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </button>
        </>
      )}

      {/* Slide indicators */}
      {showIndicators && slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
          {slides.map((slide) => (
            <button
              key={slide._id}
              onClick={() => goToSlide(slides.indexOf(slide))}
              className={`w-3 h-3 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 ${
                slides.indexOf(slide) === currentIndex
                  ? "bg-white w-8"
                  : "bg-white/50 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${slides.indexOf(slide) + 1}`}
            />
          ))}
        </div>
      )}

      {/* Keyboard navigation */}
      <div className="sr-only">
        <p>Use arrow keys to navigate slides</p>
      </div>
    </div>
  );
}
