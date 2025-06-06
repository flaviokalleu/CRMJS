import React from "react";
import Navbar from "../components/landpage/Navbar";
import HeroSection from "../components/landpage/HeroSection";
import CardGrid from "../components/landpage/CardGrid";
import Icones from "../components/landpage/Icones";
import CTASection from "../components/landpage/CTASection";
import PartnersSection from "../components/landpage/PartnersSection";
import TestimonialTabs from "../components/landpage/TestimonialTabs";
import Footer from "../components/landpage/Footer";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-black">
      <Navbar />
      <HeroSection />

      {/* Seção de ícones para benefícios ou diferenciais */}
      <div className="py-8">
        <Icones />
      </div>

      {/* Propriedades em destaque */}
      <CardGrid />

      {/* Chamada para ação */}
      <CTASection />

      {/* Parceiros */}
      <PartnersSection />

      {/* Depoimentos de clientes */}
      <div className="py-12 bg-gradient-to-br from-blue-950 via-blue-900 to-black">
        <TestimonialTabs />
      </div>

      {/* Rodapé */}
      <Footer />
    </div>
  );
};

export default LandingPage;
