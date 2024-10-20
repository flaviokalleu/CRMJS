import React from "react";
import Navbar from "../components/landpage/Navbar";
import HeroSection from "../components/landpage/HeroSection";
import CardGrid from "../components/landpage/CardGrid";
import Icones from "../components/landpage/Icones"; // Importe o componente Icones
import CTASection from "../components/landpage/CTASection";
import PartnersSection from "../components/landpage/PartnersSection";

import TestimonialTabs from "../components/landpage/TestimonialTabs";
import Footer from "../components/landpage/Footer"; // Importe o componente Footer

const LandingPage = () => {
  return (
    <div className="">
      <Navbar />
      <HeroSection />
      {/*<Icones />  Seção de ícones adicionada aqui */}
      <CardGrid />
      <CTASection />
      <PartnersSection />
      <TestimonialTabs />
      <Footer /> {/* Seção de rodapé adicionada aqui */}
    </div>
  );
};

export default LandingPage;
