import React from "react";

const PartnersSection = () => {
  const partners = [
    {
      id: 1,
      logo: "construsolida.jpg",
      name: "Construsolida",
    },
    {
      id: 2,
      logo: "construteto.jpg",
      name: "Construteto",
    },
    {
      id: 3,
      logo: "gois.png",
      name: "Góis",
    },
    {
      id: 4,
      logo: "global.png",
      name: "Global",
    },
    {
      id: 5,
      logo: "mabel.jpg",
      name: "Mabel",
    },
    {
      id: 6,
      logo: "bp.png",
      name: "BP",
    },
  ];

  return (
    <section className="bg-gradient-to-br from-blue-950 via-blue-900 to-black py-12 lg:py-20">
      <div className="mx-auto max-w-screen-xl px-4">
        <h2 className="mb-10 lg:mb-16 text-3xl font-extrabold tracking-tight leading-tight text-center text-blue-100 md:text-4xl drop-shadow-lg">
          Você estará em boa companhia
        </h2>
        <div className="grid grid-cols-2 gap-8 sm:gap-12 md:grid-cols-3 lg:grid-cols-6">
          {partners.map((partner) => (
            <div
              key={partner.id}
              className="flex flex-col items-center justify-center group"
            >
              <div className="flex justify-center items-center w-24 h-24 md:w-32 md:h-32 border-2 border-blue-700 rounded-full bg-white shadow-xl overflow-hidden transition-transform duration-300 group-hover:scale-110">
                <img
                  src={`/${partner.logo}`}
                  alt={partner.name}
                  className="h-full w-full object-cover  grayscale group-hover:grayscale-0 transition-all duration-300"
                  style={{ aspectRatio: "1/1" }}
                  loading="lazy"
                />
              </div>
              <span className="mt-4 text-blue-200 font-semibold text-center text-sm md:text-base group-hover:text-blue-400 transition">
                {partner.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
