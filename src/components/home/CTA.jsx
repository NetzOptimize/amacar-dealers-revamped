import { AnimatedSection } from "../common/AnimatedSection/AnimatedSection";
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle, Star, Users, TrendingUp } from 'lucide-react';

export default function CTA () {
    const {user} = useSelector((state) => state.user);
    const navigate = useNavigate();
    return (
      <section  className="py-12 bg-gradient-to-r from-[#1F274D] to-[#1A2436] relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 border border-white/20 rounded-full" />
          <div className="absolute top-40 right-32 w-24 h-24 border border-white/20 rounded-full" />
          <div className="absolute bottom-32 left-32 w-40 h-40 border border-white/20 rounded-full" />
          <div className="absolute bottom-20 right-20 w-28 h-28 border border-white/20 rounded-full" />
        </div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimatedSection>
            <div className="text-center mb-16">
              <div className="inline-block px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full mb-6">
                <span className="text-white font-semibold text-sm">Ready to Get Started?</span>
              </div>
              
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Ready to Get Started?
              </h2>
              
              <p className="text-xl sm:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed mb-4">
                Join as a Dealer — Acquire Smarter. Sell Smarter. Grow Faster.
              </p>
              
              <p className="text-lg sm:text-xl text-white/80 max-w-4xl mx-auto leading-relaxed mb-12">
                Be among the first in the nation to access the complete Amacar dual-market platform.
              </p>
              
              {/* Key Benefits */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {[
                  { icon: <CheckCircle className="w-6 h-6" />, text: "Zero Per-Unit Fees" },
                  { icon: <TrendingUp className="w-6 h-6" />, text: "Live Auction + Reverse Bidding" },
                  { icon: <Users className="w-6 h-6" />, text: "500+ Trusted Dealers" },
                  { icon: <Star className="w-6 h-6" />, text: "First Reverse Bidding Platform in the Nation" }
                ].map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center justify-center space-x-3 text-white/90"
                  >
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      {benefit.icon}
                    </div>
                    <span className="font-medium">{benefit.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              {user ? (
                  <motion.button
                    onClick={() => navigate("/dashboard")}
                    whileHover={{ 
                      scale: 1.05, 
                      boxShadow: "0 25px 50px rgba(79, 70, 229, 0.4)" 
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="cursor-pointer group px-10 py-5 bg-[#4F46E5] text-white text-lg font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center space-x-3"
                  >
                    <span>Go to Dashboard</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
              ) : (
                <>
                  <motion.button
                    onClick={() => navigate('/register')}
                    whileHover={{ 
                      scale: 1.05, 
                      boxShadow: "0 25px 50px rgba(255, 255, 255, 0.3)" 
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="cursor-pointer group px-10 py-5 bg-white text-[#1F274D] text-lg font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center space-x-3"
                  >
                    <span>Join as Dealer</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </>
              )}
            </div>
            
            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center mt-16"
            >
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-12 text-white/80">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 fill-[#15A9D8] text-[#15A9D8]" />
                  <span className="font-medium">4.9/5 Rating</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span className="font-medium">500+ Active Dealers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">100% Secure Platform</span>
                </div>
              </div>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>
    );
  };