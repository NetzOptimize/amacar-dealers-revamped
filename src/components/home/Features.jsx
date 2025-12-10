import { motion } from 'framer-motion';
import { Car, Zap, Link2, Shield, TrendingUp, Clock, BarChart3, Sparkles, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function Features() {
  const [expandedCards, setExpandedCards] = useState({});

  const toggleCard = (index) => {
    setExpandedCards(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const coreFeatures = [
    {
      icon: <Car className="w-6 h-6" />,
      title: "Exclusive Access to Private Sellers",
      summary: "Get first access to motivated private sellers before they ever reach CarMax, Carvana, or any third-party buyer.",
      description: "Get first access to motivated private sellers before they ever reach CarMax, Carvana, or any third-party buyer. Acquire high-quality trade-ins and off-market units directly from customers—without running from auction to auction, paying heavy auction fees, or taking on unnecessary reconditioning expenses. With Amacar Live Auctions, you stay ahead of the competition as the customer becomes your showroom—ready to sell, buy, or trade directly with your dealership. This creates new sales opportunities for your Sales Team, F&I department, and Used Car inventory, while saving your store thousands in recon costs.",
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Reverse Bidding Marketplace: The First in the Nation",
      summary: "Transform your inventory into real, high-intent buyer opportunities with real-time price drops.",
      description: "Transform your inventory into real, high-intent buyer opportunities. Buyers select the exact car they want, and dealers compete with real-time price drops—giving your store full control of floor price, timing, and strategy. No wasted leads. No tire kickers. Only serious buyers ready to close. Dealer Advantages: Sell more cars with minimal negotiation, convert online shoppers into confirmed appointments, outperform competitors by simply offering the customer the best price up front, close deals faster with transparent, stress free processes, and boost CSI percentage, Increase manufacturer CSI bonus programs.",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Real-Time Bidding Platform",
      summary: "Compete live—whether you're bidding to acquire inventory or lowering your price to win a serious buyer.",
      description: "Compete live—whether you're bidding to acquire inventory or lowering your price to win a serious buyer.",
    },
  ];

  const operationalFeatures = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Zero Dollar Unit Fees",
      summary: "Protect your gross. Pay nothing per vehicle—only acquire and sell on your terms.",
      description: "Protect your gross. Pay nothing per vehicle—only acquire and sell on your terms.",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Advanced Analytics for Buying and Selling",
      summary: "Access real-time competitor pricing, competitive insights, performance data, and buyer engagement reports.",
      description: "Access real-time competitor pricing, competitive insights, performance data, and buyer engagement reports.",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "24/7 Platform Access",
      summary: "Stay connected. Never miss a seller or a ready buyer with full desktop and mobile responsive access.",
      description: "Stay connected. Never miss a seller or a ready buyer with full desktop and mobile responsive access.",
    },
    {
      icon: <Link2 className="w-6 h-6" />,
      title: "System Integration",
      summary: "Sync inventory automatically into the Reverse Bidding marketplace. Connect your DMS and manage everything in one place.",
      description: "Sync inventory automatically into the Reverse Bidding marketplace. Connect your DMS and manage everything in one place. Amacar offers all.",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Know the car before you bid, never bid blind.",
      summary: "Amacar's next-generation Appraisal Intelligence instantly identifies visible dings, dents, scratches, and exterior wear from vehicle photos.",
      description: "Amacar's next-generation Appraisal Intelligence instantly identifies visible dings, dents, scratches, and exterior wear from the vehicle photos — all seamlessly integrated into your Dealer Portal with every detail upfront so you bid smarter and purchase with confidence.",
    },
  ];

  const allFeatures = [...coreFeatures, ...operationalFeatures];

  return (
    <section id="features" className="relative py-15 lg:py-18 bg-white overflow-hidden">
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
          <span className="text-xs font-medium text-indigo-900">Why Dealers Choose Us</span>
        </motion.div>

        {/* Section Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-4 text-center"
        >
          Why Dealers Choose Us
        </motion.h2>

        {/* Summary Bar */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-lg text-gray-600 leading-relaxed text-center max-w-3xl mx-auto mb-12"
        >
          Smarter acquisition, stronger margins, and real-time tools that help your dealership win.
        </motion.p>

        {/* Section Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center space-y-4 mb-16 max-w-3xl mx-auto"
        >
          <p className="text-lg text-gray-600 leading-relaxed text-center">
            Amacar is the only platform in the nation that lets your dealership acquire smarter with Live Auctions and sell faster through Live Reverse Bidding.
          </p>
          <p className="text-base text-gray-600 leading-relaxed text-center">
            Your sales team never has to say, "Let me check with my Manager" again when selling a car. They close the deal on the spot, with the final sales price locked in and the appointment confirmed in real time.
          </p>
        </motion.div>

        {/* Core Acquisition Tools Section */}
        <div className="mb-16">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-semibold text-gray-900 mb-8 text-center"
          >
            Core Acquisition Tools
          </motion.h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group p-8 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full"
              >
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-500 flex items-center justify-center text-white mb-6 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                
                {/* Title */}
                <h3 className="text-xl font-semibold text-gray-900 mb-3 leading-tight">
                  {feature.title}
                </h3>
                
                {/* Summary */}
                <p className="text-base text-gray-600 leading-relaxed mb-4" style={{ lineHeight: '1.7' }}>
                  {feature.summary}
                </p>

                {/* Expandable Content */}
                {feature.description !== feature.summary && (
                  <>
                    <motion.div
                      initial={false}
                      animate={{
                        height: expandedCards[index] ? 'auto' : 0,
                        opacity: expandedCards[index] ? 1 : 0
                      }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 border-t border-gray-100">
                        <p className="text-base text-gray-600 leading-relaxed" style={{ lineHeight: '1.7', maxWidth: '480px' }}>
                          {feature.description.replace(feature.summary, '').trim()}
                        </p>
                      </div>
                    </motion.div>

                    {/* Learn More Toggle */}
                    <button
                      onClick={() => toggleCard(index)}
                      className="mt-4 flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors self-start"
                    >
                      <span>{expandedCards[index] ? 'Show Less' : 'Learn More'}</span>
                      <motion.div
                        animate={{ rotate: expandedCards[index] ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </motion.div>
                    </button>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Operational Benefits Section */}
        <div>
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-semibold text-gray-900 mb-8 text-center"
          >
            Operational Benefits
          </motion.h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {operationalFeatures.map((feature, index) => {
              const globalIndex = coreFeatures.length + index;
              return (
                <motion.div
                  key={globalIndex}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="group p-8 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full"
                >
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-500 flex items-center justify-center text-white mb-6 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 leading-tight">
                    {feature.title}
                  </h3>
                  
                  {/* Summary */}
                  <p className="text-base text-gray-600 leading-relaxed mb-4" style={{ lineHeight: '1.7' }}>
                    {feature.summary}
                  </p>

                  {/* Expandable Content */}
                  {feature.description !== feature.summary && (
                    <>
                      <motion.div
                        initial={false}
                        animate={{
                          height: expandedCards[globalIndex] ? 'auto' : 0,
                          opacity: expandedCards[globalIndex] ? 1 : 0
                        }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 border-t border-gray-100">
                          <p className="text-base text-gray-600 leading-relaxed" style={{ lineHeight: '1.7', maxWidth: '480px' }}>
                            {feature.description.replace(feature.summary, '').trim()}
                          </p>
                        </div>
                      </motion.div>

                      {/* Learn More Toggle */}
                      <button
                        onClick={() => toggleCard(globalIndex)}
                        className="mt-4 flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors self-start"
                      >
                        <span>{expandedCards[globalIndex] ? 'Show Less' : 'Learn More'}</span>
                        <motion.div
                          animate={{ rotate: expandedCards[globalIndex] ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </motion.div>
                      </button>
                    </>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
