import { AnimatedSection } from "../common/AnimatedSection/AnimatedSection";
import { motion } from "framer-motion";
import { UserPlus, Search, Gavel, CheckCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function HowItWorks() {
  const navigate = useNavigate();

  const liveAuctionSteps = [
    {
      number: "1",
      title: "Sign Up in Minutes",
      description:
        "Quick dealer verification → instant access.",
      icon: <UserPlus className="w-8 h-8" />,
      gradient: "from-[#4F46E5] to-[#4F46E5]",
    },
    {
      number: "2",
      title: "Browse Quality Inventory",
      description:
        "See real private sellers with full vehicle reports and images.",
      icon: <Search className="w-8 h-8" />,
      gradient: "from-[#15A9D8] to-[#15A9D8]",
    },
    {
      number: "3",
      title: "Bid & Win Instantly",
      description:
        "Participate in live auctions and confirmed appointments.",
      icon: <Gavel className="w-8 h-8" />,
      gradient: "from-[#2E93E1] to-[#2E93E1]",
    },
  ];

  const reverseBiddingSteps = [
    {
      number: "1",
      title: "Your Inventory Goes Live",
      description:
        "Imported Automatically and Updated Automatically.",
      icon: <UserPlus className="w-8 h-8" />,
      gradient: "from-[#4F46E5] to-[#4F46E5]",
    },
    {
      number: "2",
      title: "Buyers Select the Car They Want",
      description:
        "No shopping around. No sleeping on the price. No talking to the wife, no kids to pick up from school. Only direct buyer intent.",
      icon: <Search className="w-8 h-8" />,
      gradient: "from-[#15A9D8] to-[#15A9D8]",
    },
    {
      number: "3",
      title: "Dealers Compete by Lowering Price",
      description:
        "Compete using precise, real-time price adjustments designed to capture the buyer at the optimal moment.",
      icon: <Gavel className="w-8 h-8" />,
      gradient: "from-[#2E93E1] to-[#2E93E1]",
    },
    {
      number: "4",
      title: "Buyer Accepts the Best Offer",
      description:
        "System sets appointment → Customer Shows Up, the Car is Sold. No negotiations. No pressure. Maximum conversions.",
      icon: <CheckCircle className="w-8 h-8" />,
      gradient: "from-[#4F46E5] to-[#4F46E5]",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-18 bg-gradient-to-br from-white to-[#F8F9FA]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-20">
          <div className="inline-block px-4 py-2 bg-[#4F46E5]/10 rounded-full mb-6">
            <span className="text-[#4F46E5] font-semibold text-sm">
              How It Works for Dealers
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1A1A1A] mb-6 leading-tight">
            How It Works for Dealers
          </h2>
        </AnimatedSection>

        {/* Live Auction Section */}
        <div className="mb-16 lg:mb-20">
          <AnimatedSection className="text-center mb-10 lg:mb-12">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1A1A1A] mb-4">
              Live Auction (Inventory Acquisition)
            </h3>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 relative">
            {/* Connection lines for desktop */}
            <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-[#4F46E5] via-[#15A9D8] to-[#2E93E1] opacity-20" />

            {liveAuctionSteps.map((step, index) => (
              <AnimatedSection key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  whileHover={{
                    y: -8,
                    scale: 1.02,
                    boxShadow: "0 25px 50px rgba(79, 70, 229, 0.15)",
                  }}
                  className="relative group"
                >
                  {/* Step number with gradient */}
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-10">
                    <div
                      className={`w-12 h-12 bg-gradient-to-r ${step.gradient} rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-2xl group-hover:scale-110 transition-transform duration-300`}
                    >
                      {step.number}
                    </div>
                  </div>

                  {/* Card */}
                  <div className="relative p-6 lg:p-8 pt-12 bg-white rounded-2xl border border-[#E5E5E5] shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:border-[#4F46E5]/20 h-full flex flex-col">
                    <h3 className="text-xl lg:text-2xl font-bold text-[#1A1A1A] mb-3 lg:mb-4 group-hover:text-[#4F46E5] transition-colors duration-300 leading-tight">
                      {step.title}
                    </h3>
                    <p className="text-sm lg:text-base text-[#4A4A4A] leading-relaxed group-hover:text-[#1A1A1A] transition-colors duration-300 flex-grow">
                      {step.description}
                    </p>
                    {/* Hover indicator */}
                    <div
                      className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${step.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}
                    />
                  </div>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>

        {/* Reverse Bidding Section */}
        <div>
          <AnimatedSection className="text-center mb-10 lg:mb-12">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1A1A1A] mb-4">
              Reverse Bidding (Selling Cars Fast)
            </h3>
            <p className="text-lg lg:text-xl text-[#4A4A4A] max-w-3xl mx-auto leading-relaxed">
              Sell your new or used cars faster than any marketplace in the nation.
            </p>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 relative">
            {/* Connection lines for desktop */}
            <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-[#4F46E5] via-[#15A9D8] via-[#2E93E1] to-[#4F46E5] opacity-20" />

            {reverseBiddingSteps.map((step, index) => (
              <AnimatedSection key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  whileHover={{
                    y: -8,
                    scale: 1.02,
                    boxShadow: "0 25px 50px rgba(79, 70, 229, 0.15)",
                  }}
                  className="relative group"
                >
                  {/* Step number with gradient */}
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-10">
                    <div
                      className={`w-12 h-12 bg-gradient-to-r ${step.gradient} rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-2xl group-hover:scale-110 transition-transform duration-300`}
                    >
                      {step.number}
                    </div>
                  </div>

                  {/* Card */}
                  <div className="relative p-6 lg:p-8 pt-12 bg-white rounded-2xl border border-[#E5E5E5] shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:border-[#4F46E5]/20 h-full flex flex-col">
                    <h3 className="text-lg lg:text-xl font-bold text-[#1A1A1A] mb-3 lg:mb-4 group-hover:text-[#4F46E5] transition-colors duration-300 leading-tight">
                      {step.title}
                    </h3>
                    <p className="text-sm text-[#4A4A4A] leading-relaxed group-hover:text-[#1A1A1A] transition-colors duration-300 flex-grow">
                      {step.description}
                    </p>
                    {/* Hover indicator */}
                    <div
                      className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${step.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}
                    />
                  </div>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        {/* <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
          onClick={() => navigate("/register")}
        >
          <div className="inline-flex items-center space-x-2 px-6 py-3 bg-[#4F46E5] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group">
            <span>Get Started Today</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div> */}
      </div>
    </section>
  );
}
