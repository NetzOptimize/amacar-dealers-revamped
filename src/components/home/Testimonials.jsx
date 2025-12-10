import React, { useState, useEffect, useCallback } from "react";
import { Star, Quote, Calendar, User, Building2, Users, Sparkles } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import "./testimonial.css";
import { motion } from "framer-motion";

export default function TestimonialCarousel() {
  const [api, setApi] = useState();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: "Mario G",
      role: "Customer",
      date: "December 6, 2024",
      rating: 5,
      text: "Using Amacar to sell my car eliminated all the usual frustration of multiple stops with multiple dealers while giving me the confidence that I got the best deal before I stepped foot in a dealership. Amacar stands out for its seamless and efficient process among the top websites to sell your car out there. I can't imagine selling my car any other way in the future.",
      image:
        "https://dealer.amacar.ai/wp-content/uploads/2024/12/trust-him-with-your-business-2024-07-16-01-00-21-utc-min.jpg",
      category: "customer",
    },
    {
      id: 2,
      name: "Alex R.",
      role: "Dealership",
      date: "December 6, 2024",
      rating: 5,
      text: "Reverse Bidding changed everything for us. Buyers select the exact car they want, and instead of chasing leads, we simply compete by adjusting the price. No back-and-forth negotiation—just real buyers ready to purchase. It's the future.",
      image:
        "https://dealer.amacar.ai/wp-content/uploads/2024/12/close-up-portrait-of-smiling-handsome-business-man-2024-10-18-05-05-50-utc-min-1.jpg",
      category: "dealership",
      position: "General Manager at Toyota Los Angeles"
    },
    {
      id: 3,
      name: "Jason F",
      role: "Customer",
      date: "December 6, 2024",
      rating: 5,
      text: "If you are short on time, go through Amacar. I put in all my information and got my instant cash offer easily – but the best part was the auction. With essentially no effort, I got all the info I needed from dealers while skipping the runaround, set an appointment, and walked in to sell my car for cash, hand in my keys, and sign some quick paperwork. It's never been easier.",
      image:
        "https://dealer.amacar.ai/wp-content/uploads/2024/12/successful-businessman-2023-11-27-05-21-29-utc-min.jpg",
      category: "customer",
    },
    {
      id: 4,
      name: "John D",
      role: "Customer",
      date: "December 6, 2024",
      rating: 5,
      text: "Selling my car through Amacar was effortless. I received competitive offers quickly from one of the most trusted online car selling websites and was able to choose the best one for me.",
      image:
        "https://dealer.amacar.ai/wp-content/uploads/2024/12/stately-bald-man-with-a-full-short-beard-in-a-blac-2023-11-27-05-35-31-utc-min-1.jpg",
      category: "customer",
    },
    {
      id: 5,
      name: "Ali J",
      role: "Dealership",
      date: "December 6, 2024",
      rating: 5,
      text: "We were getting increasingly frustrated by unexpected repair costs on our used cars bought from the online auction we previously used most. Using Amacar has allowed us to benefit from a 'local auction' platform that also allows us to verify condition before finalizing the purchase – now we can know exactly what we are buying with no surprises.",
      image:
        "https://dealer.amacar.ai/wp-content/uploads/2024/12/positive-about-his-new-job-2023-11-27-05-07-30-utc-min-1.jpg",
      category: "dealership",
    },
    {
      id: 6,
      name: "Jennifer K",
      role: "Customer",
      date: "August 24, 2024",
      rating: 5,
      text: "Amacar should be the new normal. I'm a data nerd and being able to see the different offers I got from dealers in real time was amazing. Also, having the ability to only accept the offer I wanted made me feel like I still had the choice to do whatever was best for me and my family with this transaction.",
      image:
        "https://dealer.amacar.ai/wp-content/uploads/2024/08/smile-portrait-and-business-woman-in-studio-isola-2023-11-27-05-01-41-utc-min.jpg",
      category: "customer",
    },
  ];

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  const scrollTo = useCallback(
    (index) => {
      api?.scrollTo(index);
    },
    [api]
  );

  const getRoleColor = (role) => {
    return role === "Customer"
      ? "text-[#4F46E5] bg-[#4F46E5]/10"
      : "text-[#4F46E5] bg-[#4F46E5]/10";
  };

  const getRoleIcon = (role) => {
    return role === "Customer" ? (
      <User className="w-4 h-4" />
    ) : (
      <Building2 className="w-4 h-4" />
    );
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "text-indigo-600 fill-indigo-600" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <section className="relative py-15 lg:py-18 bg-white overflow-hidden">
      {/* Subtle Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 via-white to-white" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8 flex flex-col">
        {/* Section Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="w-max mx-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100/50 mb-6"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span className="text-xs font-medium text-indigo-900">Testimonials</span>
        </motion.div>

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-4">
            What Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">Users</span> Say
          </h2>
          <div className="flex justify-center mb-12">
            <p className="text-lg text-gray-600 max-w-2xl leading-relaxed text-center">
              Discover why thousands of customers and dealerships trust Amacar
            </p>
          </div>
        </motion.div>

        {/* Carousel Container */}
        <div className="relative">
          <Carousel
            setApi={setApi}
            opts={{
              align: "start",
              loop: true,
            }}
            plugins={[
              Autoplay({
                delay: 4000,
                stopOnInteraction: false,
                stopOnMouseEnter: true,
              }),
            ]}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {testimonials.map((testimonial, index) => (
                <CarouselItem
                  key={testimonial.id}
                  className="pl-2 md:pl-4 md:basis-1/2"
                >
                  <div className="group relative bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden h-full">
                    {/* Quote Icon */}
                    <div className="flex justify-between items-start mb-4">
                      <Quote className="w-6 h-6 text-indigo-600" />
                      <div className="flex items-center gap-1">
                        {renderStars(testimonial.rating)}
                      </div>
                    </div>

                    {/* Testimonial Text */}
                    <p className="text-gray-700 leading-relaxed mb-6 line-clamp-4 text-base">
                      {testimonial.text}
                    </p>

                    {/* User Info */}
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                        />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center bg-gradient-to-r from-indigo-600 to-blue-500 text-white">
                          {getRoleIcon(testimonial.role)}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm">
                          {testimonial.name}
                        </h4>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-indigo-900 bg-indigo-50">
                            {getRoleIcon(testimonial.role)}
                            {testimonial.role}
                          </span>
                        </div>
                        {testimonial.position && (
                          <p className="text-xs text-gray-600 mb-1">{testimonial.position}</p>
                        )}
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>{testimonial.date}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Navigation Arrows */}
            <CarouselPrevious className="cursor-pointer absolute left-6 top-1/2 transform -translate-y-1/2 -translate-x-6 bg-white rounded-full p-4 transition-all duration-300 border border-gray-200 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-blue-500 hover:border-transparent hover:text-white shadow-sm hover:shadow-md" />
            <CarouselNext className="cursor-pointer absolute right-6 top-1/2 transform -translate-y-1/2 translate-x-6 bg-white rounded-full p-4 transition-all duration-300 border border-gray-200 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-blue-500 hover:border-transparent hover:text-white shadow-sm hover:shadow-md" />
          </Carousel>

          {/* Dots Navigation */}
          <div className="flex justify-center space-x-2 mt-8">
            {Array.from({ length: count }, (_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`cursor-pointer w-3 h-3 rounded-full transition-all duration-300 ${
                  index === current - 1
                    ? "bg-gradient-to-r from-indigo-600 to-blue-500 scale-125"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
      
          {/* Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid md:grid-cols-2 gap-8 mt-16 items-center justify-center max-w-4xl mx-auto"
          >
            <div className="text-center p-8 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all z-[9]">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-4">
                <Users className="w-8 h-8" />
              </div>
              <p className="text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 mb-2">500+</p>
              <p className="text-gray-600 font-medium">Trusted Dealers</p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all z-[9]">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-4">
                <Star className="w-8 h-8" />
              </div>
              <p className="text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 mb-2">4.9/5</p>
              <p className="text-gray-600 font-medium">Better Business Rating</p>
            </div>
          </motion.div>
    </section>
  );
}
