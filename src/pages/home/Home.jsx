import CTA from "@/components/home/CTA";
import FAQ from "@/components/home/FAQ";
import Features from "@/components/home/Features";
import Hero from "@/components/home/Hero";
import Highlights from "@/components/home/Highlights";
import HowItWorks from "@/components/home/HowItWorks";
import SuccessStories from "@/components/home/SuccessStories";
import ValueProposition from "@/components/home/ValueProposition";
import Navbar from "@/components/layout/Header/Navbar";
import React from "react";
import Footer from "@/components/layout/Footer/Footer";
import BrandLogosCarousel from "@/components/home/BrandLogosCarousel";
import HomeNew from "../home-new/HomeNew";
import HomeNewNew from "../home-new-new/HomeNewNew";
import TestimonialCarousel from "@/components/home/Testimonials";

const Home = () => {
  return (
    <div className="font-sans antialiased ">
      <Navbar />
      <div className="mt-4">
        {/* <HomeNewNew /> */}
        <Hero />
        <ValueProposition />
        <Features />
        <BrandLogosCarousel />
        <Highlights />
        <HowItWorks />
        <SuccessStories />
        <TestimonialCarousel />
        <FAQ />
        <CTA />
        <Footer />
      </div>
    </div>
  );
};

export default Home;
