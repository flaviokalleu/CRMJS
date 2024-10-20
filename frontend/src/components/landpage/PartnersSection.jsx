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
    <section className="bg-white py-8 lg:py-16">
      <div className="mx-auto max-w-screen-xl px-4">
        <h2 className="mb-8 lg:mb-16 text-3xl font-extrabold tracking-tight leading-tight text-center text-green-700 md:text-4xl">
          Você estará em boa companhia
        </h2>
        <div className="grid grid-cols-2 gap-8 sm:gap-12 md:grid-cols-3 lg:grid-cols-6">
          {partners.map((partner) => (
            <a
              key={partner.id}
              href="#"
              className="flex justify-center items-center transition-transform transform hover:scale-105"
            >
              <div className="flex justify-center items-center w-24 h-24 md:w-32 md:h-32 border-2 border-green-500 rounded-full bg-white shadow-md overflow-hidden">
                <img
                  src={`/${partner.logo}`} // Assuming images are in the public folder
                  alt={partner.name}
                  className="h-full w-full object-cover"
                />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
