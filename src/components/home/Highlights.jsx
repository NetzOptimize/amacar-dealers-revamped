import { motion } from 'framer-motion';
import { Zap, Link2, BarChart3, Sparkles } from 'lucide-react';

export default function Highlights() {
  const highlights = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Early Access to Seller Listings",
      description: "Instant priority to motivated private sellers—way before your competition."
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Exclusive Access to Ready Buyers",
      description: "Your inventory is offered directly to buyers who already selected the exact year, make, and model they want. You compete by lowering the price—buyers choose the best offer. You get confirmed appointments and closed sales, higher closing ratios and minimum response time."
    },
    {
      icon: <Link2 className="w-6 h-6" />,
      title: "Live Bidding. Instant Results. Two Ways.",
      description: "Live Auction Bidding – Acquire Cars: Bid live on private seller vehicles with full transparency high quality photos. Reverse Bidding – Sell More Cars: Compete by lowering the sales price until the timer ends and the buyer accepts an offer."
    }
  ];

  return (
    <section className="relative py-15 lg:py-18 bg-white overflow-hidden">
      {/* Subtle Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 via-white to-white" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {highlights.map((item, index) => (
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
              <h3 className="text-xl font-semibold text-gray-900 mb-3 leading-tight">
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
