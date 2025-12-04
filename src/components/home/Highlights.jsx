import { motion } from 'framer-motion';
import { Zap, Link2, BarChart3 } from 'lucide-react';
import { AnimatedSection } from "../common/AnimatedSection/AnimatedSection";


export default function Highlights () {
    const highlights = [
      {
        icon: <Zap className="w-8 h-8" />,
        title: "Early Access to Seller Listings (Phase 1)",
        description: "Instant priority to motivated private sellers—way before your competition."
      },
      {
        icon: <BarChart3 className="w-8 h-8" />,
        title: "Exclusive Access to Ready Buyers (Phase 2)",
        description: "Your inventory is offered directly to buyers who already selected the exact year, make, and model they want. You compete by lowering the price—buyers choose the best offer. You get confirmed appointments and closed sales, higher closing ratios and minimum response time."
      },
      {
        icon: <Link2 className="w-8 h-8" />,
        title: "Live Bidding. Instant Results. Two Ways.",
        description: "Live Auction Bidding – Acquire Cars: Bid live on private seller vehicles with full transparency high quality photos. Reverse Bidding – Sell More Cars: Compete by lowering the sales price until the timer ends and the buyer accepts an offer."
      }
    ];
  
    return (
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {highlights.map((item, index) => (
              <AnimatedSection key={index}>
                <motion.div
                  whileHover={{ scale: 1.01, y: -4 }}
                  className="p-6 lg:p-8 bg-white rounded-2xl shadow-lg border border-[#E5E5E5] h-full flex flex-col"
                >
                  <div className="w-12 h-12 lg:w-14 lg:h-14 bg-[#4A90E2] rounded-xl flex items-center justify-center text-white mb-4 lg:mb-6 flex-shrink-0">
                    {item.icon}
                  </div>
                  <h3 className="text-lg lg:text-xl font-bold text-[#1A1A1A] mb-3 leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-sm lg:text-base text-[#4A4A4A] leading-relaxed flex-grow">
                    {item.description}
                  </p>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    );
  };