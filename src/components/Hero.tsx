"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

const images = [
  "/images/1.webp",
  "/images/2.webp",
  "/images/3.webp",
  "/images/4.webp",
  "/images/5.webp",
  "/images/6.webp",
];

const Hero: React.FC = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  useEffect(() => {
    const interval = setInterval(nextImage, 5000);
    return () => clearInterval(interval);
  }, [currentImageIndex]);

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        {images.map((src, index) => (
          <Image
            key={src}
            src={src}
            alt={`Slide ${index + 1}`}
            fill
            className={`object-cover transition-opacity duration-1000 ${index === currentImageIndex ? "opacity-100" : "opacity-0"
              }`}
            priority={index === 0}
          />
        ))}
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={prevImage}
        className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/50 hover:bg-white/80 text-primary p-2 rounded-full z-20"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={nextImage}
        className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/50 hover:bg-white/80 text-primary p-2 rounded-full z-20"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Navigation Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`w-3 h-3 rounded-full ${index === currentImageIndex ? "bg-white" : "bg-white/50"
              }`}
          ></button>
        ))}
      </div>


      {/* Curved Overlay */}
      <div className="absolute top-0 right-0 w-1/2 h-full">
        <div className="relative w-full h-full">
          <svg
            className="absolute right-0 w-full h-full"
            viewBox="0 0 400 800"
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M180 0C320 120 400 300 320 400C260 500 370 600 400 800H400V0H180Z"
              fill="url(#heroGradient)"
              fillOpacity="0.3"
            />
            <defs>
              <linearGradient
                id="heroGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#FF6B35" />
                <stop offset="100%" stopColor="#A5D6A7" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-white bg-black/20 p-8 rounded-lg backdrop-blur-sm">
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Her Çocuk
              <span className="block text-secondary">Özel ve Değerli</span>
            </h1>
            <p className="font-body text-lg sm:text-xl text-white/90 mb-8 leading-relaxed">
              Özel eğitim ve rehabilitasyon alanında uzman kadromuzla, her
              çocuğun potansiyelini keşfetmesi ve gelişmesi için bireysel eğitim
              programları sunuyoruz.
            </p>
            <div className="hidden md:flex flex-col sm:flex-row gap-4">
              <button
                onClick={() =>
                  document
                    .getElementById("contact")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="bg-secondary text-white px-8 py-4 rounded-full font-body font-semibold hover:bg-secondary/90 transition-all duration-300 transform hover:scale-105"
              >
                Randevu Alın
              </button>
              <button
                onClick={() =>
                  document
                    .getElementById("about")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="bg-white text-primary px-8 py-4 rounded-full font-body font-semibold hover:bg-gray-200 transition-all duration-300"
              >
                Daha Fazla Bilgi
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold text-secondary mb-2">
                  500+
                </div>
                <div className="font-body text-neutral-dark/80">
                  Başarılı Öğrenci
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold text-secondary mb-2">
                  15+
                </div>
                <div className="font-body text-neutral-dark/80">
                  Yıl Deneyim
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold text-secondary mb-2">
                  98%
                </div>
                <div className="font-body text-neutral-dark/80">
                  Aile Memnuniyeti
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold text-secondary mb-2">
                  24/7
                </div>
                <div className="font-body text-neutral-dark/80">
                  Destek Hattı
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;