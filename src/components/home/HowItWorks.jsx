import { motion } from "framer-motion";
import { UserPlus, Search, Gavel, CheckCircle, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function HowItWorks() {
  const navigate = useNavigate();

  const liveAuctionSteps = [
    {
      number: "1",
      title: "Sign Up in Minutes",
      description: "Quick dealer verification → instant access.",
      icon: <UserPlus className="w-6 h-6" />,
    },
    {
      number: "2",
      title: "Browse Quality Inventory",
      description: "See real private sellers with full vehicle reports and images.",
      icon: <Search className="w-6 h-6" />,
    },
    {
      number: "3",
      title: "Bid & Win Instantly",
      description: "Participate in live auctions and confirmed appointments.",
      icon: <Gavel className="w-6 h-6" />,
    },
  ];

  const reverseBiddingSteps = [
    {
      number: "1",
      title: "Your Inventory Goes Live",
      description: "Imported Automatically and Updated Automatically.",
      icon: <UserPlus className="w-6 h-6" />,
    },
    {
      number: "2",
      title: "Buyers Select the Car They Want",
      description: "No shopping around. No sleeping on the price. No talking to the wife, no kids to pick up from school. Only direct buyer intent.",
      icon: <Search className="w-6 h-6" />,
    },
    {
      number: "3",
      title: "Dealers Compete by Lowering Price",
      description: "Compete using precise, real-time price adjustments designed to capture the buyer at the optimal moment.",
      icon: <Gavel className="w-6 h-6" />,
    },
    {
      number: "4",
      title: "Buyer Accepts the Best Offer",
      description: "System sets appointments and confirms with customer → Customer Shows Up, the Car is Sold. No negotiations. No back and forth. Only Maximum conversions.",
      icon: <CheckCircle className="w-6 h-6" />,
    },
  ];

  return (
    <section id="how-it-works" className="relative py-15 lg:py-18 bg-white overflow-hidden">
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
          <span className="text-xs font-medium text-indigo-900">How It Works for Dealers</span>
        </motion.div>

        {/* Section Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-12 text-center"
        >
          How It Works for Dealers
        </motion.h2>

        {/* Live Auction Section */}
        <div className="mb-20">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl lg:text-3xl font-semibold text-gray-900 mb-8 text-center"
          >
            Live Auction (Inventory Acquisition)
          </motion.h3>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {liveAuctionSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="relative p-6 lg:p-8 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all h-full flex flex-col"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-500 flex items-center justify-center text-white mb-4 flex-shrink-0">
                  {step.icon}
                </div>
                <div className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-900">{step.number}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 leading-tight">
                  {step.title}
                </h3>
                <p className="text-base text-gray-600 leading-relaxed flex-grow">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Reverse Bidding Section */}
        <div>
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl lg:text-3xl font-semibold text-gray-900 mb-4 text-center"
          >
            Reverse Bidding
          </motion.h3>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center max-w-3xl mx-auto mb-12"
          >
            <p className="text-lg text-gray-600 leading-relaxed mb-4 text-center">
              Sell your new or used cars faster than any marketplace in the nation.
            </p>
            <p className="text-base text-gray-600 leading-relaxed text-center">
              API-Powered Inventory Sync: Your dealership inventory automatically appears in the Reverse Bidding marketplace with real-time pricing controls.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {reverseBiddingSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="relative p-6 lg:p-8 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all h-full flex flex-col"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-500 flex items-center justify-center text-white mb-4 flex-shrink-0">
                  {step.icon}
                </div>
                <div className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-900">{step.number}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 leading-tight">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed flex-grow">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
