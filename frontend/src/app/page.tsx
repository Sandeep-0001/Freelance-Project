"use client";

import Link from "next/link";
import {
  Rocket,
  IndianRupee,
  TrendingUp,
  Network,
  ShieldCheck,
  Users,
} from "lucide-react";
import ImageSlider from "@/app/_components/ImageSlider";
import LandingContentSections from "@/app/_components/LandingContentSections";
import LandingHero from "@/app/_components/LandingHero";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function Home() {
  const [sliderUpdate, setSliderUpdate] = useState(0);

  // Listen for slider updates from admin panel
  useEffect(() => {
    const handleStorageChange = () => {
      setSliderUpdate(prev => prev + 1);
    };

    // Listen for storage changes (when admin updates sliders)
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Slider */}
      <section className="relative h-[50vh] sm:h-[65vh] md:h-[65vh] max-h-[600px] sm:max-h-[900px]">
        {/* <ImageSlider 
          key={sliderUpdate}
          className="w-full h-full"
          autoPlay={true}
          interval={5000}
          showControls={true}
          showIndicators={true}
          externalUpdate={sliderUpdate}
        /> */}
        <Image
          src="/brand/banner2.jpg"
          alt="Hero Image"
          fill
          className="object-cover h-full w-full"
        />
      </section>

      {/* Hero Content Section */}
      <LandingHero />
      {/* <section className="py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
              Grow Your Income Through
              <span className="text-blue-600"> Smart Referrals</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-800 mb-6 sm:mb-8 md:mb-12 leading-relaxed">
              Join ReferGrow and build your financial freedom with our innovative referral platform featuring binary tree structure and Business Volume distribution.
            </p>
            
            <div className="flex flex-col gap-3 sm:gap-4 justify-center">
              <Link
                prefetch={false}
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 transition-all text-sm sm:text-base"
              >
                <Rocket className="w-4 sm:w-5 h-4 sm:h-5" />
                Get Started Free
              </Link>
              <Link
                prefetch={false}
                href="/business-opportunity"
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gray-100 text-gray-900 font-medium rounded-lg border border-gray-300 hover:bg-gray-200 transition-all text-sm sm:text-base"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section> */}
      {/* Content Sections */}
      <LandingContentSections />
      {/* Features Section */}
      {/* <section className="py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Why Choose ReferGrow?
            </h2>
            <p className="text-base sm:text-lg text-gray-800 max-w-2xl mx-auto">
              Build your network and earn with our proven referral system
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <div className="bg-white rounded-lg p-6 sm:p-8 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <IndianRupee className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-3 text-gray-900">Earn Through Referrals</h3>
              <p className="text-sm sm:text-base text-gray-800">
                Build your network and earn income through our sophisticated Business Volume distribution system.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 sm:p-8 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Network className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-3 text-gray-900">Binary Tree Structure</h3>
              <p className="text-sm sm:text-base text-gray-800">
                Automatic placement in a balanced binary tree ensures fair distribution and growth potential.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 sm:p-8 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-3 text-gray-900">Real-time Tracking</h3>
              <p className="text-sm sm:text-base text-gray-800">
                Monitor your income, referrals, and network growth with our comprehensive dashboard.
              </p>
            </div>
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      {/* <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 sm:p-8 md:p-12 text-center text-white shadow-lg">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Ready to Start Growing?</h2>
            <p className="text-base sm:text-lg md:text-lg mb-6 sm:mb-8 text-blue-50">
              Join thousands of members already building their income through ReferGrow
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link
                prefetch={false}
                href="/register"
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
              >
                Create Free Account
              </Link>
              <Link
                prefetch={false}
                href="/services"
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors text-sm sm:text-base"
              >
                View Services
              </Link>
            </div>
          </div>
        </div>
      </section> */}

      {/* Stats Section */}
      {/* <section className="py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 text-center">
            <div className="p-4 sm:p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">10,000+</div>
              <div className="text-sm sm:text-base text-gray-800">Active Members</div>
            </div>
            <div className="p-4 sm:p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">₹50L+</div>
              <div className="text-sm sm:text-base text-gray-800">Distributed Income</div>
            </div>
            <div className="p-4 sm:p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <ShieldCheck className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">100%</div>
              <div className="text-sm sm:text-base text-gray-800">Secure Platform</div>
            </div>
          </div>
        </div>
      </section> */}
    </div>
  );
}
