import { TrendingUp, BarChart3, Award, Sparkles } from "lucide-react";
import { motion } from 'framer-motion';

export default function SuccessStories() {
  return (
    <section id="success-stories" className="relative py-15 lg:py-18py-15 lg:py-18 bg-white overflow-hidden">
      {/* Subtle Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 via-white to-white" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 flex flex-col">
        {/* Section Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100/50 mb-6 mx-auto"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span className="text-xs font-medium text-indigo-900">Success Stories</span>
        </motion.div>

        {/* Section Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-4 text-center"
        >
          Success Stories
        </motion.h2>

        {/* Section Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center mb-12"
        >
          <p className="text-lg text-gray-600 leading-relaxed max-w-3xl text-center">
            See how top-performing dealerships outperform their markets by acquiring smarter and selling faster with America's only dual-market automotive platform.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {[
            {
              icon: <TrendingUp className="w-6 h-6" />,
              title: "Boost Profit on Both Sides of the Transaction",
              description: "Smarter auction bidding for acquisition. Smarter price competition for selling. Higher margins, lower lead cost, faster turnover. More Sales, More F&I opportunity, Best CSI.",
            },
            {
              icon: <BarChart3 className="w-6 h-6" />,
              title: "Digital Tools to Scale Inventory and Sales",
              description: "From data-driven analytics to inventory integrations, everything is optimized for your store's growth.",
            },
            {
              icon: <Award className="w-6 h-6" />,
              title: "Dealers Achieving Real Results",
              description: "Stories from dealers who transformed their buying and selling operations with Amacar.",
            }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="p-6 lg:p-8 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all h-full flex flex-col"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-500 flex items-center justify-center text-white mb-4 flex-shrink-0">
                {item.icon}
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-4 leading-tight">
                {item.title}
              </h3>
              
              <p className="text-base text-gray-600 leading-relaxed flex-grow">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
