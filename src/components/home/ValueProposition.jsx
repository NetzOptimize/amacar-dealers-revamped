import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, DollarSign, Zap, Sparkles } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function ValueProposition() {
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const benefits = [
    { icon: <DollarSign className="w-4 h-4" />, text: "Save up to $1,000+ per vehicle" },
    { icon: <TrendingUp className="w-4 h-4" />, text: "90% confirmed appointments" },
    { icon: <Zap className="w-4 h-4" />, text: "High-intent buyers" }
  ];

  return (
    <section className="relative py-15 lg:py-18 bg-white overflow-hidden">
      {/* Subtle Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 via-white to-white" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="p-6 lg:p-8 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            {/* Left: Content */}
            <div className="flex-1 space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
                Buy Smarter. Sell Faster. Keep More Profit.
              </h2>
              
              <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
                Avoid traditional auction fees that can reach up to $1,000+ per vehicle, and close more deals with high-intent buyers—Let your Sales Team follow up other leads from other sources, while Amacar sends all Confirmed appointments in the system with 90% Confined and show ratios.
              </p>

              <div className="flex flex-wrap gap-3">
                {benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100/50"
                  >
                    <div className="text-indigo-600">{benefit.icon}</div>
                    <span className="text-xs font-medium text-indigo-900">{benefit.text}</span>
                  </div>
                ))}
              </div>

              <p className="text-xl font-semibold text-gray-900">
                Two Marketplaces. One Platform. Total Advantage.
              </p>
            </div>

            {/* Right: CTA */}
            <div className="flex-shrink-0">
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
                  onClick={() => navigate("/register")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-lg font-medium shadow-sm hover:shadow-md transition-all"
                >
                  <span>Start Bidding • Start Selling</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
