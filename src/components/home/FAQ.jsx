import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, HelpCircle, Sparkles } from 'lucide-react';

export default function FAQ() {
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
    <section id="faq" className="relative py-15 lg:py-18 bg-white overflow-hidden">
      {/* Subtle Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 via-white to-white" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8 flex flex-col">
        {/* Section Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100/50 mb-6 mx-auto"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span className="text-xs font-medium text-indigo-900">FAQ</span>
        </motion.div>

        {/* Section Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-4 text-center"
        >
          FAQ — Dealer Edition
        </motion.h2>

        {/* Section Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center mb-12"
        >
          <p className="text-lg text-gray-600 leading-relaxed text-center">
            Everything you need to know about joining Amacar and maximizing your success
          </p>
        </motion.div>

        <div className="space-y-8">
          {['General', 'Live Auction', 'Reverse Bidding'].map((category) => {
            const categoryFaqs = faqs.filter(faq => faq.category === category);
            if (categoryFaqs.length === 0) return null;
            
            return (
              <div key={category} className="mb-12">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">
                  {category}
                </h3>
                <div className="space-y-4">
                  {categoryFaqs.map((faq, index) => {
                    const globalIndex = faqs.indexOf(faq);
                    return (
                      <motion.div
                        key={globalIndex}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                        className="rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
                      >
                        <button
                          onClick={() => setOpenIndex(openIndex === globalIndex ? null : globalIndex)}
                          className="w-full p-6 text-left flex justify-between items-center hover:bg-gray-50 transition-colors gap-4"
                        >
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-500 flex items-center justify-center text-white flex-shrink-0">
                              <HelpCircle className="w-5 h-5" />
                            </div>
                            <span className="font-semibold text-gray-900 text-lg leading-tight">
                              {faq.question}
                            </span>
                          </div>
                          <motion.div
                            animate={{ 
                              rotate: openIndex === globalIndex ? 180 : 0,
                            }}
                            transition={{ duration: 0.3 }}
                            className="flex-shrink-0"
                          >
                            {openIndex === globalIndex ? (
                              <Minus className="w-5 h-5 text-gray-600" />
                            ) : (
                              <Plus className="w-5 h-5 text-gray-600" />
                            )}
                          </motion.div>
                        </button>
                        <motion.div
                          initial={false}
                          animate={{
                            height: openIndex === globalIndex ? 'auto' : 0,
                            opacity: openIndex === globalIndex ? 1 : 0
                          }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-6 text-base text-gray-600 leading-relaxed border-t border-gray-200">
                            <div className="pt-4">
                              {faq.answer}
                            </div>
                          </div>
                        </motion.div>
                      </motion.div>
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
}
