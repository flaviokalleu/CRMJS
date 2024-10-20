import React from "react";

const ContactUsSection = () => {
  return (
    <div className="my-10 max-w-full mx-auto bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-4xl font-bold text-center mb-6 text-green-600">
        Venha tomar um café conosco
      </h2>
      <div className="mb-6">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d958.440074111288!2d-47.983056630472845!3d-16.077923910388613!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x935985df7f7889f7%3A0x3c8b378471608011!2sParnass%C3%A1%20Imobili%C3%A1ria!5e0!3m2!1spt-BR!2sbr!4v1725482063750!5m2!1spt-BR!2sbr"
          width="100%"
          height="400"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
        ></iframe>
      </div>
      <div className="text-center text-black mb-6">
        <p className="mb-2">
          <strong>Endereço:</strong> Nº SN - Parque Esplanada III, Valparaíso de Goiás - GO
        </p>
        <p className="mb-2">
          <strong>Rua:</strong> R. Vinte e Nove, 01, Valparaíso de Goiás - GO, 72876-354
        </p>
        <p>
          <strong>Telefone:</strong> (61) 98637-4261
        </p>
      </div>
      <div className="text-center">
        <a
          href="https://www.google.com/maps/dir//N%C2%BA+SN+-+Parque+Esplanada+III,+Valpara%C3%ADso+de+Goi%C3%A1s+-+GO+Rua,+R.+Vinte+e+Nove,+01,+Valpara%C3%ADso+de+Goi%C3%A1s+-+GO,+72876-354/@-16.0779094,-48.0648147,12z/data=!4m8!4m7!1m0!1m5!1m1!1s0x935985df7f7889f7:0x3c8b378471608011!2m2!1d-47.982531!2d-16.0779749?entry=ttu&g_ep=EgoyMDI0MDkwMi4wIKXMDSoASAFQAw%3D%3D"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-600 text-white font-bold py-3 px-6 rounded transition duration-300 hover:bg-green-700"
        >
          Obtenha direções
        </a>
      </div>
    </div>
  );
};

export default ContactUsSection;
