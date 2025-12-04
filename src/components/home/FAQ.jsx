import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Plus, Minus, HelpCircle } from 'lucide-react';
import { AnimatedSection } from "../common/AnimatedSection/AnimatedSection";

export default function FAQ ()  {
    const [openIndex, setOpenIndex] = useState(null);
  
    const faqs = [
      { 
        category: "General",
        question: "What is Amacar?", 
        answer: "Amacar is a digital vehicle marketplace that connects verified dealerships like yours with private sellers. Dealers can bid on consumer vehicles through live auctions or attract new buyers via Reverse Bidding." 
      },
      { 
        category: "General",
        question: "How do dealerships sign up?", 
        answer: "Register on Amacar's dealer portal, sign up and set up your account. Once approved by Amacar's team, you'll gain access to live seller listings, reverse bidding, and dealer platform." 
      },
      { 
        category: "General",
        question: "How much can dealers save per month by joining Amacar?", 
        answer: "Dealerships can save thousands each month. For example, if you acquire 30 units from traditional auctions at $1,000 per unit, that's $30,000 in fees. With Amacar, you pay only a low monthly subscription and gain unlimited opportunities to acquire unlimited vehicles—no per-unit auction fees." 
      },
      { 
        category: "Live Auction",
        question: "How do dealer auctions work?", 
        answer: "Sellers list their vehicles online after appraisal. Participating dealers can place bids in real time. The highest accepted bid wins, and you complete the transaction directly with the customer." 
      },
      { 
        category: "Live Auction",
        question: "Do I need to set up appointment with the customers?", 
        answer: "Yes, you can set up appointment with the customer for in-person appraisal. However, Amacar Customer Platform is designed to set up appointment with the customer once they accept the best offer." 
      },
      { 
        category: "Live Auction",
        question: "What if my bid is not accepted?", 
        answer: "If a seller declines your offer, it may mean your bid wasn't competitive. You can continue placing bids on other vehicles during the live auction." 
      },
      { 
        category: "Live Auction",
        question: "Is there a limit to the number of cars I can bid on?", 
        answer: "No. With your monthly subscription, you can place unlimited bids across unlimited vehicles. We ask that all offers be genuine and honored to respect the customer's time and protect your dealership's reputation." 
      },
      { 
        category: "Reverse Bidding",
        question: "What is Reverse Bidding?", 
        answer: "Reverse Bidding allows you to compete for a buyer's new or pre-owned vehicle purchase by lowering your sale price in real time. This creates a transparent, competitive environment where buyers see the best deals upfront." 
      },
      { 
        category: "Reverse Bidding",
        question: "How long do reverse bidding events last?", 
        answer: "Each event lasts up to 4 hours. You'll receive real-time alerts when a customer shows interest in your inventory or when you're outbid—giving you the chance to win the sale or adjust your pricing strategy during the event." 
      },
      { 
        category: "Reverse Bidding",
        question: "What does it cost to join Amacar?", 
        answer: "Dealers pay a flat monthly subscription fee. There is no per-unit fee, auction fees or commissions charged by Amacar. Sign up now to get full access with 7 days trial." 
      },
      { 
        category: "Reverse Bidding",
        question: "How are transactions completed?", 
        answer: "All offers, paperwork, and payments are handled directly between your dealership and the customer. Amacar simply facilitates the connection and does not intervene in the final terms of the deal. Dealers competitively lower the sales price, and the customer chooses the best offer." 
      },
      { 
        category: "Reverse Bidding",
        question: "What is the minimum amount to bid down on a New or Used car to outbid others?", 
        answer: "The minimum bid-down amount is $100 in order to place a competitive offer and outbid other participating dealers." 
      },
      { 
        category: "Reverse Bidding",
        question: "When do the reverse bidding offers expire?", 
        answer: "Reverse-bidding offers remain valid for 7 days from the moment the customer accepts the offer, unless a manufacturer's incentive expires sooner. If incentive programs change or expire, it is at the dealership's discretion whether to honor the original offer." 
      }
    ];
  
    return (
      <section id="faq" className="py-16 lg:py-18 bg-gradient-to-br from-[#F8F9FA] to-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12 lg:mb-20">
            <div className="inline-block px-4 py-2 bg-[#4F46E5]/10 rounded-full mb-6">
              <span className="text-[#4F46E5] font-semibold text-sm">FAQ</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-[#1A1A1A] mb-4 lg:mb-6 leading-tight">
              FAQ — Dealer Edition
            </h2>
            <p className="text-lg lg:text-xl text-[#4A4A4A] max-w-3xl mx-auto leading-relaxed">
              Everything you need to know about joining Amacar and maximizing your success
            </p>
          </AnimatedSection>

          <div className="space-y-8 lg:space-y-10">
            {/* Group FAQs by category */}
            {['General', 'Live Auction', 'Reverse Bidding'].map((category) => {
              const categoryFaqs = faqs.filter(faq => faq.category === category);
              if (categoryFaqs.length === 0) return null;
              
              return (
                <div key={category} className="mb-10 lg:mb-12">
                  <h3 className="text-xl lg:text-2xl font-bold text-[#1A1A1A] mb-5 lg:mb-6 pb-2 border-b-2 border-[#4F46E5]/20">
                    {category}
                  </h3>
                  <div className="space-y-4 lg:space-y-6">
                    {categoryFaqs.map((faq, index) => {
                      const globalIndex = faqs.indexOf(faq);
                      return (
                        <AnimatedSection key={globalIndex}>
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            whileHover={{ scale: 1.01 }}
                            className="group bg-white rounded-2xl border border-[#E5E5E5] shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden"
                          >
                            <button
                              onClick={() => setOpenIndex(openIndex === globalIndex ? null : globalIndex)}
                              className="cursor-pointer w-full p-6 lg:p-8 text-left flex justify-between items-start lg:items-center hover:bg-gradient-to-r hover:from-[#4F46E5]/5 hover:to-[#15A9D8]/5 transition-all duration-300 group gap-4"
                            >
                              <div className="flex items-start lg:items-center space-x-3 lg:space-x-4 flex-1 min-w-0">
                                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-[#4F46E5] to-[#4F46E5] rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                                  <HelpCircle className="w-4 h-4 lg:w-5 lg:h-5" />
                                </div>
                                <span className="font-bold text-[#1A1A1A] text-base lg:text-lg group-hover:text-[#4F46E5] transition-colors duration-300 leading-tight">
                                  {faq.question}
                                </span>
                              </div>
                              <motion.div
                                animate={{ 
                                  rotate: openIndex === globalIndex ? 180 : 0,
                                  scale: openIndex === globalIndex ? 1.1 : 1
                                }}
                                transition={{ duration: 0.3 }}
                                className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl flex items-center justify-center text-[#4F46E4] shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0"
                              >
                                {openIndex === globalIndex ? (
                                  <Minus className="w-4 h-4 lg:w-5 lg:h-5" />
                                ) : (
                                  <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
                                )}
                              </motion.div>
                            </button>
                            <motion.div
                              initial={false}
                              animate={{
                                height: openIndex === globalIndex ? 'auto' : 0,
                                opacity: openIndex === globalIndex ? 1 : 0
                              }}
                              transition={{ duration: 0.4, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <div className="px-6 lg:px-8 pb-6 lg:pb-8 text-sm lg:text-base text-[#4A4A4A] leading-relaxed border-t border-[#E5E5E5] bg-gradient-to-r from-[#F8F9FA] to-white">
                                <div className="pt-4 lg:pt-6">
                                  {faq.answer}
                                </div>
                              </div>
                            </motion.div>
                          </motion.div>
                        </AnimatedSection>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  };
  