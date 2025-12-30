import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle, Star, Users, TrendingUp, Sparkles } from 'lucide-react';

export default function CTA() {
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();
  
  return (
    <section className="relative py-15 lg:py-18 bg-white overflow-hidden">
      {/* Subtle Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 via-white to-white" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          {/* Section Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100/50 mb-6"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-xs font-medium text-indigo-900">Ready to Get Started?</span>
          </motion.div>

          {/* Section Title */}
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-4">
            Ready to Get Started?
          </h2>
          
          {/* Section Description */}
          <div className="flex flex-col items-center max-w-3xl mx-auto mb-12">
            <p className="text-lg text-gray-600 leading-relaxed mb-4 text-center">
              Join as a Dealer — Acquire Smarter. Sell Smarter. Grow Faster.
            </p>
            <p className="text-base text-gray-600 leading-relaxed text-center">
              Be among the first in the nation to access the complete Amacar dual-market platform.
            </p>
          </div>
          
          {/* Key Benefits */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { icon: <CheckCircle className="w-5 h-5" />, text: "Zero Per-Unit Fees" },
              { icon: <TrendingUp className="w-5 h-5" />, text: "Live Auction + Reverse Bidding" },
              { icon: <Users className="w-5 h-5" />, text: "500+ Trusted Dealers" },
              { icon: <Star className="w-5 h-5" />, text: "First Reverse Bidding Platform in the Nation" }
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-center justify-center gap-3 text-gray-900"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100/50 flex items-center justify-center text-indigo-600">
                  {benefit.icon}
                </div>
                <span className="font-medium text-sm lg:text-base">{benefit.text}</span>
              </motion.div>
            ))}
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            {user ? (
              <motion.button
                onClick={() => navigate("/dashboard")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg font-medium shadow-sm hover:shadow-md transition-all"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            ) : (
              <motion.button
                onClick={() => navigate('/register')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-lg font-medium shadow-sm hover:shadow-md transition-all"
              >
                <span>Join as Dealer</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            )}
          </div>
          
          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 text-gray-600"
          >
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-indigo-600 fill-indigo-600" />
              <span className="font-medium">4.9/5 Better Business Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <span className="font-medium">500+ Trusted Dealers</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
