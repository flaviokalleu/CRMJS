import React, { useState } from "react";

const FAQAccordion = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "Qual é o horário de funcionamento?",
      answer: "Estamos abertos de segunda a sexta, das 9h às 18h.",
    },
    {
      question: "Como posso entrar em contato?",
      answer: "Você pode entrar em contato pelo e-mail ou telefone fornecido.",
    },
    {
      question: "Quais são as opções de pagamento?",
      answer: "Aceitamos cartão de crédito, débito e transferência bancária.",
    },
    {
      question: "Vocês oferecem suporte técnico?",
      answer: "Sim, oferecemos suporte técnico em horário comercial.",
    },
  ];

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="my-10 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-6 text-white">
        Perguntas Frequentes
      </h2>
      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {faqs.map((faq, index) => (
          <div key={index} className="border-b border-gray-700">
            <button
              className={`flex justify-between items-center w-full text-left px-4 py-4 text-white transition duration-300 ease-in-out hover:bg-gray-700 rounded-lg focus:outline-none ${
                openIndex === index ? "bg-gray-700" : ""
              }`}
              onClick={() => toggleAccordion(index)}
            >
              <h3 className="text-lg font-medium">{faq.question}</h3>
              <span
                className={`transform transition-transform duration-300 ${
                  openIndex === index ? "rotate-180" : ""
                }`}
              >
                ▼
              </span>
            </button>
            {openIndex === index && (
              <div className="p-4 bg-gray-700 rounded-b-lg transition-all duration-300">
                <p className="text-gray-300">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQAccordion;
