
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown, Play, X, ArrowRight, Shield, Zap, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import LoginModal from '../ui/LoginUI/LoginModal';
import { useNavigate } from 'react-router-dom';


export default function Hero() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const [showVideo, setShowVideo] = useState(false);
  const { user } = useSelector((state) => state.user);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const navigate = useNavigate();
  const handleForgotPassword = () => {
    setLoginModalOpen(true);
  };
  return (
    <div className="relative min-h-[70vh] sm:min-h-[75vh] lg:min-h-[80vh] flex items-center justify-center overflow-hidden bg-white">
      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-20 sm:pt-24 lg:pt-28 pb-12 sm:pb-16 lg:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
          {/* Left Column - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left order-2 lg:order-1"
          >

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-[#1A1A1A] mb-6 sm:mb-8 leading-tight sm:leading-none">
              <span className="block mb-1 sm:mb-2">
                <span className="text-[#1A1A1A]">
                  Buy Smarter.
                </span>
              </span>
              <span className="block mb-1 sm:mb-2">
                <span className="bg-gradient-to-r from-[#4F46E5] to-[#15A9D8] bg-clip-text text-transparent">
                  Sell Faster.
                </span>
              </span>
              <span className="block text-black">
                Keep More Profit.
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-[#4A4A4A] max-w-2xl mx-auto lg:mx-0 mb-8 sm:mb-10 lg:mb-12 leading-relaxed font-light px-2 sm:px-0">
              Avoid traditional auction fees that can reach up to $1,000+ per vehicle, and close more deals with high-intent buyers—Let your Sales Team follow up other leads from other sources, while Amacar sends all Confirmed appointments in the system with 90% Confirmed and show ratios.
            </p>
            
            <p className="text-lg sm:text-xl md:text-2xl font-semibold text-[#1A1A1A] max-w-2xl mx-auto lg:mx-0 mb-8 sm:mb-10 lg:mb-12 leading-relaxed px-2 sm:px-0">
              Two Marketplaces. One Platform. Total Advantage.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              {user ? (
                <motion.button
                  onClick={() => navigate("/dashboard")}
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(79, 70, 229, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center gap-2 border-2 border-[#4F46E5] cursor-pointer px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base text-[#4F46E5] rounded-lg font-semibold shadow-lg bg-white hover:bg-[#4F46E5]/10 transition-colors w-full sm:w-auto"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              ) : (
                <>
                  <motion.button
                    onClick={() => navigate("/register")}
                    whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(79, 70, 229, 0.4)" }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#15A9D8] cursor-pointer px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
                  >
                    <span>Start Bidding</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.button>

                </>
              )}
            </div>
          </motion.div>

          {/* Right Column - Video Thumbnail */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative order-1 lg:order-2"
          >
            <div
              className="relative h-[35vh] sm:h-[40vh] md:h-[45vh] lg:h-[50vh] xl:h-[55vh] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl bg-white border border-[#E5E5E5] p-2 sm:p-3 cursor-pointer group hover:shadow-3xl transition-all duration-500 hover:scale-105"
              onClick={() => setShowVideo(true)}
            >
              <div className="relative w-full h-full bg-[#4F46E5] rounded-xl sm:rounded-2xl">
                {/* Professional video thumbnail */}
                <div className="text-center h-full p-3 sm:p-4 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center mb-3 sm:mb-4 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-2xl">
                    <Play className="w-6 h-6 sm:w-8 sm:h-8 text-[#4F46E5] ml-0.5 sm:ml-1" />
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-4 text-white/80 text-xs sm:text-sm">
                    <span>• Real-time bidding</span>
                    <span>• Instant access</span>
                  </div>
                </div>

                {/* Subtle overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Professional scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="mt-6 sm:mt-8 lg:mt-10 text-center"
        >
          <div className="inline-flex flex-col items-center space-y-1 sm:space-y-2">
            <span className="text-[#6B6B6B] text-xs sm:text-sm font-medium">Scroll to explore</span>
            <a href="/#features"><ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-[#6B6B6B]" /></a>
          </div>
        </motion.div>
      </div>

      {/* Professional Video Modal */}
      {showVideo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
          onClick={() => setShowVideo(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative w-full max-w-4xl sm:max-w-5xl lg:max-w-6xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Professional close button */}
            <button
              onClick={() => setShowVideo(false)}
              className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 z-10 w-8 h-8 sm:w-12 sm:h-12 bg-[#4F46E5] hover:bg-[#2E93E1] rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-2xl hover:scale-110"
            >
              <X className="w-4 h-4 sm:w-6 sm:h-6" />
            </button>

            {/* Video container with professional styling */}
            <div className="relative w-full bg-black rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src="https://player.vimeo.com/video/1112370692?badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1&controls=0"
                className="absolute top-0 left-0 w-full h-full"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                title="AmacarAI Video B2B EDITED"
              />
            </div>
          </motion.div>
        </motion.div>
      )}

      {loginModalOpen && (
        <LoginModal
          isOpen={loginModalOpen}
          onClose={() => setLoginModalOpen(false)}
          onForgotPassword={handleForgotPassword}
        />
      )}
    </div>
  );
};