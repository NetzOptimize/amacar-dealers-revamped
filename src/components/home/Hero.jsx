import { motion } from 'framer-motion';
import { Play, X, ArrowRight, Sparkles } from 'lucide-react';
import { useState } from 'react';

export default function Hero() {
  const [showVideo, setShowVideo] = useState(false);
  const [user, setUser] = useState(null); // Simulate Redux user state
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  
  const navigate = (path) => console.log('Navigate to:', path);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white">
      {/* Minimal background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 via-white to-white" />
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8 lg:space-y-10"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100/50"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-xs font-medium text-indigo-900">America's First Dual-Marketplace</span>
            </motion.div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight leading-[1.1]">
                AMACAR
              </h1>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-gray-600 leading-tight">
                The Smarter Way for Dealers to{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
                  Buy & Sell
                </span>
              </h2>
            </div>

            {/* Description */}
            <p className="text-lg text-gray-600 leading-relaxed max-w-xl">
              Source better cars through Live Auctions and sell more cars through the nation's first Reverse Bidding platform—all in one place.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3">
              {user ? (
                <motion.button
                  onClick={() => navigate("/dashboard")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg font-medium shadow-sm hover:shadow-md transition-all"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </motion.button>
              ) : (
                <>
                  <motion.button
                    onClick={() => navigate("/register")}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-lg font-medium shadow-sm shadow-indigo-500/20 hover:shadow-md hover:shadow-indigo-500/30 transition-all"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </motion.button>
                  
                  <motion.button
                    onClick={() => setShowVideo(true)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-lg font-medium border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
                  >
                    <Play className="w-4 h-4" />
                    <span>Watch Demo</span>
                  </motion.button>
                </>
              )}
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-6 pt-2">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 via-blue-400 to-blue-500 ring-2 ring-white"
                  />
                ))}
              </div>
              <div className="text-sm">
                <p className="font-semibold text-gray-900">2,500+ Dealers</p>
                <p className="text-gray-500">Trusted by the industry</p>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Image/Video Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            {/* Main Card */}
            <div
              onClick={() => setShowVideo(true)}
              className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer bg-gradient-to-br from-indigo-500 via-indigo-600 to-blue-600 shadow-2xl shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-300"
            >
              {/* Placeholder Dashboard Image */}
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <div className="w-full h-full bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 flex flex-col gap-4">
                  {/* Mock Dashboard Elements */}
                  <div className="flex gap-3">
                    <div className="h-3 w-20 bg-white/30 rounded-full" />
                    <div className="h-3 w-16 bg-white/20 rounded-full" />
                    <div className="h-3 w-24 bg-white/20 rounded-full" />
                  </div>
                  <div className="flex-1 bg-white/20 rounded-lg" />
                  <div className="grid grid-cols-3 gap-3">
                    <div className="h-16 bg-white/20 rounded-lg" />
                    <div className="h-16 bg-white/20 rounded-lg" />
                    <div className="h-16 bg-white/20 rounded-lg" />
                  </div>
                </div>
              </div>

              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-16 h-16 rounded-full bg-white shadow-2xl flex items-center justify-center"
                >
                  <Play className="w-7 h-7 text-indigo-600 ml-0.5" fill="currentColor" />
                </motion.div>
              </div>

              {/* Feature Pills */}
              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
                <div className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm">
                  <span className="text-xs font-medium text-gray-900">Real-time Bidding</span>
                </div>
                <div className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm">
                  <span className="text-xs font-medium text-gray-900">Instant Access</span>
                </div>
              </div>
            </div>

            {/* Floating Stats Cards */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute -left-4 top-1/4 px-4 py-3 rounded-xl bg-white shadow-lg border border-gray-100"
            >
              <p className="text-2xl font-bold text-gray-900">$2.5M+</p>
              <p className="text-xs text-gray-500">Daily Volume</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="absolute -right-4 bottom-1/4 px-4 py-3 rounded-xl bg-white shadow-lg border border-gray-100"
            >
              <p className="text-2xl font-bold text-gray-900">15k+</p>
              <p className="text-xs text-gray-500">Cars Listed</p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Video Modal */}
      {showVideo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowVideo(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowVideo(false)}
              className="absolute -top-3 -right-3 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-900 hover:bg-gray-100 transition-colors shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative w-full bg-black rounded-xl overflow-hidden shadow-2xl" style={{ paddingBottom: '56.25%' }}>
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
    </div>
  );
}