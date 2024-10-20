const CTASection = () => {
  return (
    <section className="relative bg-white px-4 py-16 antialiased md:py-24">
      <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-white opacity-20"></div>
      <h1 className="mb-6 text-3xl text-center font-bold leading-tight tracking-tight text-green-700 md:text-5xl z-10 relative">
        Transforme o seu sonho em realidade!
      </h1>
      <p className="mb-8 text-lg text-center text-gray-600 z-10 relative">
        Você sabia que pode ter sua casa própria pagando menos do que o aluguel? 
        A Parnassa Imobiliária está aqui para ajudar você nessa jornada!
      </p>
      <div className="mx-auto grid max-w-screen-xl rounded-lg bg-white p-6 md:p-10 lg:grid-cols-12 lg:gap-8 lg:p-16 relative z-10">
        <div className="lg:col-span-5 lg:mt-0 flex justify-center">
          <img
            className="h-64 w-64 sm:h-80 sm:w-80 md:h-96 md:w-96"
            src="https://seeklogo.com/images/M/minha-casa-minha-vida-logo-8F022589E6-seeklogo.com.png" // URL for a 3D character image (replace with a suitable image)
            alt="3D Character"
          />
        </div>
        <div className="me-auto place-self-center lg:col-span-7">
          <h2 className="mb-4 text-2xl font-semibold leading-tight tracking-tight text-green-700 md:text-4xl">
            Economize enquanto conquista seu espaço!
          </h2>
          <p className="mb-6 text-gray-600">
            Ao invés de pagar aluguel, invista no seu futuro e conquiste a casa dos seus sonhos. 
            Com a Parnassa Imobiliária, você tem acesso a ofertas exclusivas e condições que cabem no seu bolso.
          </p>
          <a
            href="#"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-base font-medium text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-300"
          >
            Vamos conversar sobre sua nova casa!
          </a>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
