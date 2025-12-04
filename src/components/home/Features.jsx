
import { motion } from 'framer-motion';
import { Car, Zap, Link2, Shield, TrendingUp, Clock, Users, BarChart3 } from 'lucide-react';
import { AnimatedSection } from "../common/AnimatedSection/AnimatedSection";

export default function Features () {
    const features = [
      {
        icon: <Car className="w-8 h-8" />,
        title: "Exclusive Access to Private Sellers (Phase 1 – Live Auction)",
        description: "Get first access to motivated private sellers before they ever reach CarMax, Carvana, or any third-party buyer. Acquire high-quality trade-ins and off-market units directly from customers—without running from auction to auction, paying heavy auction fees, or taking on unnecessary reconditioning expenses.",
        gradient: "from-[#4F46E5] to-[#4F46E5]"
      },
      {
        icon: <TrendingUp className="w-8 h-8" />,
        title: "Reverse Bidding Marketplace: The First in the Nation (Phase 2)",
        description: "Transform your inventory into real, high-intent buyer opportunities. Buyers select the exact car they want, and dealers compete with real-time price drops—giving your store full control of floor price, timing, and strategy. No wasted leads. No tire kickers. Only serious buyers ready to close.",
        gradient: "from-[#15A9D8] to-[#15A9D8]"
      },
      {
        icon: <Zap className="w-8 h-8" />,
        title: "Real-Time Bidding Platform",
        description: "Compete live—whether you're bidding to acquire inventory or bidding down a price to win a serious buyer.",
        gradient: "from-[#2E93E1] to-[#2E93E1]"
      },
      {
        icon: <Shield className="w-8 h-8" />,
        title: "Zero Per-Unit Fees",
        description: "Keep your gross strong. Pay nothing per unit—only win, buy, and sell on your terms.",
        gradient: "from-[#4F46E5] to-[#4F46E5]"
      },
      {
        icon: <BarChart3 className="w-8 h-8" />,
        title: "Advanced Analytics for Buying and Selling",
        description: "Access real-time competitor pricing, competitive insights, performance data, and buyer engagement reports.",
        gradient: "from-[#15A9D8] to-[#15A9D8]"
      },
      {
        icon: <Clock className="w-8 h-8" />,
        title: "24/7 Platform Access",
        description: "Stay connected. Never miss a seller or a ready buyer with full desktop and mobile responsive access.",
        gradient: "from-[#2E93E1] to-[#2E93E1]"
      },
      {
        icon: <Link2 className="w-8 h-8" />,
        title: "System Integration",
        description: "Sync inventory automatically into the Reverse Bidding marketplace. Connect your DMS and manage everything in one place. Amacar offers all.",
        gradient: "from-[#4F46E5] to-[#4F46E5]"
      }
    ];
  
    return (
      <section id="features" className="py-18 bg-gradient-to-br from-[#F8F9FA] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12 lg:mb-20">
            <div className="inline-block px-4 py-2 bg-[#4F46E5]/10 rounded-full mb-6">
              <span className="text-[#4F46E5] font-semibold text-sm">Why Dealers Choose Us</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-[#1A1A1A] mb-4 lg:mb-6 leading-tight">
              Why Dealers Choose Us
            </h2>
            <p className="text-lg lg:text-xl text-[#4A4A4A] max-w-3xl mx-auto leading-relaxed mb-3 lg:mb-4">
              Amacar is the only platform in the nation that lets your dealership acquire smarter with Live Auctions and sell faster through Live Reverse Bidding.
            </p>
            <p className="text-base lg:text-lg text-[#4A4A4A] max-w-3xl mx-auto leading-relaxed">
              Your sales team never has to say, "Let me check with my Manager" again. They close the deal on the spot, with the final sales price locked in and the appointment confirmed in real time.
            </p>
          </AnimatedSection>
  
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ 
                  y: -8, 
                  scale: 1.01,
                  boxShadow: "0 25px 50px rgba(79, 70, 229, 0.15)" 
                }}
                className="group p-6 lg:p-8 bg-white rounded-2xl border border-[#E5E5E5] shadow-lg hover:shadow-2xl transition-all duration-500 relative overflow-hidden flex flex-col h-full"
              >
                {/* Subtle background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-100`} />
                
                <div className={`w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center text-white mb-4 lg:mb-6 group-hover:scale-110 transition-transform duration-100 shadow-lg flex-shrink-0`}>
                  {feature.icon}
                </div>
                
                <h3 className="text-lg lg:text-xl font-bold text-[#1A1A1A] mb-3 lg:mb-4 group-hover:text-[#4F46E5] transition-colors duration-100 leading-tight">
                  {feature.title}
                </h3>
                
                <p className="text-sm lg:text-base text-[#4A4A4A] leading-relaxed group-hover:text-[#1A1A1A] transition-colors duration-100 flex-grow">
                  {feature.description}
                </p>
                
                {/* Hover indicator */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#4F46E5] to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  };
  