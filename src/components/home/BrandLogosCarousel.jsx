import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

const BrandLogosCarousel = ({ className = "", pauseOnHover = true }) => {
  const [isPaused, setIsPaused] = useState(false);

  const brandLogos = [
    { name: 'Kia', logo: 'https://dealer.amacar.ai/wp-content/uploads/2024/12/Kia-logo-2560x1440-1.png', alt: 'Kia Logo' },
    { name: 'Jeep', logo: 'https://dealer.amacar.ai/wp-content/uploads/2024/12/jeep-logo-1993-download.png', alt: 'Jeep Logo' },
    { name: 'Infiniti', logo: 'https://dealer.amacar.ai/wp-content/uploads/2024/12/Infiniti-logo-1989-2560x1440-1.png', alt: 'Infiniti Logo' },
    { name: 'Hyundai', logo: 'https://dealer.amacar.ai/wp-content/uploads/2024/12/hyundai-logo-2011-download.png', alt: 'Hyundai Logo' },
    { name: 'Mercedes-Benz', logo: 'https://dealer.amacar.ai/wp-content/uploads/2024/12/Mercedes-Benz-logo-2011-1920x1080-1.png', alt: 'Mercedes-Benz Logo' },
    { name: 'Mazda', logo: 'https://dealer.amacar.ai/wp-content/uploads/2024/12/mazda-logo-2018-vertical-download.png', alt: 'Mazda Logo' },
    { name: 'Lincoln', logo: 'https://dealer.amacar.ai/wp-content/uploads/2024/12/Lincoln-logo-2019-1920x1080-1.png', alt: 'Lincoln Logo' },
    { name: 'Lexus', logo: 'https://dealer.amacar.ai/wp-content/uploads/2024/12/Lexus-logo-1988-1920x1080-1.png', alt: 'Lexus Logo' },
    { name: 'Toyota', logo: 'https://dealer.amacar.ai/wp-content/uploads/2024/12/toyota-logo-2019-download.png', alt: 'Toyota Logo' },
    { name: 'Tesla', logo: 'https://dealer.amacar.ai/wp-content/uploads/2024/12/tesla-logo-2007-full-download.png', alt: 'Tesla Logo' },
    { name: 'Subaru', logo: 'https://dealer.amacar.ai/wp-content/uploads/2024/12/subaru-logo-2019-download.png', alt: 'Subaru Logo' },
    { name: 'RAM', logo: 'https://dealer.amacar.ai/wp-content/uploads/2024/12/RAM-logo-2009-2560x1440-1.png', alt: 'RAM Logo' },
    { name: 'BMW', logo: 'https://dealer.amacar.ai/wp-content/uploads/2024/12/bmw-logo-2020-gray-download.png', alt: 'BMW Logo' },
    { name: 'Audi', logo: 'https://dealer.amacar.ai/wp-content/uploads/2024/12/audi-logo-2016-download.png', alt: 'Audi Logo' },
    { name: 'Alfa Romeo', logo: 'https://dealer.amacar.ai/wp-content/uploads/2024/12/Alfa-Romeo-logo-2015-1920x1080-1.png', alt: 'Alfa Romeo Logo' },
    { name: 'Acura', logo: 'https://dealer.amacar.ai/wp-content/uploads/2024/12/Acura-logo-1990-1024x768-1.png', alt: 'Acura Logo' },
    { name: 'Chrysler', logo: 'https://dealer.amacar.ai/wp-content/uploads/2024/12/chrysler-logo-2009-download.png', alt: 'Chrysler Logo' },
    { name: 'Chevrolet', logo: 'https://dealer.amacar.ai/wp-content/uploads/2024/12/Chevrolet-logo-2013-2560x1440-1.png', alt: 'Chevrolet Logo' },
    { name: 'Cadillac', logo: 'https://dealer.amacar.ai/wp-content/uploads/2024/12/cadillac-logo-2021-full-download.png', alt: 'Cadillac Logo' },
    { name: 'Buick', logo: 'https://dealer.amacar.ai/wp-content/uploads/2024/12/Buick-logo-2002-2560x1440-1.png', alt: 'Buick Logo' },
    { name: 'GMC', logo: 'https://dealer.amacar.ai/wp-content/uploads/2024/12/GMC-logo-2200x600-1.png', alt: 'GMC Logo' },
    { name: 'Ford', logo: 'https://dealer.amacar.ai/wp-content/uploads/2024/12/ford-logo-2017-download.png', alt: 'Ford Logo' },
    { name: 'Dodge', logo: 'https://dealer.amacar.ai/wp-content/uploads/2024/12/dodge-logo-2010-download.png', alt: 'Dodge Logo' }
  ];

  const duplicatedLogos = [...brandLogos, ...brandLogos];

  const getLogoSize = () => {
    if (typeof window === 'undefined') return 'h-20 w-24';
    const width = window.innerWidth;
    if (width < 480) return 'h-16 w-20';
    if (width < 640) return 'h-18 w-22';
    if (width < 768) return 'h-20 w-24';
    if (width < 1024) return 'h-22 w-28';
    if (width < 1280) return 'h-24 w-32';
    return 'h-24 w-32';
  };

  const [logoSize, setLogoSize] = useState('h-20 w-24');

  useEffect(() => {
    const updateLogoSize = () => {
      setLogoSize(getLogoSize());
    };
    updateLogoSize();
    window.addEventListener('resize', updateLogoSize);
    return () => window.removeEventListener('resize', updateLogoSize);
  }, []);

  return (
    <section className="relative py-15 lg:py-18 bg-white overflow-hidden">
      {/* Subtle Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 via-white to-white" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 flex flex-col">
        {/* Section Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="w-max mx-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100/50 mb-6"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span className="text-xs font-medium text-indigo-900">Trusted Partners</span>
        </motion.div>

        {/* Section Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className=" text-center text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-4"
        >
          Trusted by Leading Brands
        </motion.h2>

        {/* Section Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center mb-12"
        >
          <p className="text-lg text-gray-600 leading-relaxed max-w-3xl text-center">
            We work with the most reputable automotive brands to bring you quality vehicles from trusted sources
          </p>
        </motion.div>

        {/* Scrolling Container */}
        <div 
          className="relative overflow-hidden rounded-2xl p-8 border border-gray-200 shadow-sm bg-white/50 backdrop-blur-sm"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div 
            className={cn(
              "flex gap-8 md:gap-12 lg:gap-16",
              isPaused ? "animate-pause" : "animate-scroll"
            )}
            style={{
              animationDuration: '60s',
              animationTimingFunction: 'linear',
              animationIterationCount: 'infinite',
              animationDirection: 'normal',
              width: 'max-content'
            }}
          >
            {duplicatedLogos.map((brand, index) => (
              <motion.div
                key={`${brand.name}-${index}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.03 }}
                className="group flex-shrink-0"
              >
                <div className={cn(
                  "bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all group-hover:scale-105 flex items-center justify-center",
                  logoSize
                )}>
                  <img
                    src={brand.logo}
                    alt={brand.alt}
                    className="max-h-12 sm:max-h-14 md:max-h-16 w-auto object-contain transition-all duration-500"
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Gradient fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
};

export default BrandLogosCarousel;
