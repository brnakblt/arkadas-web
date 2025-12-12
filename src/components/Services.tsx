"use client";

import React, { useState } from "react";
import Modal from "./Modal";
import { ServiceData } from "@/services/contentService";

interface ServicesProps {
  data: ServiceData[];
}

const iconMap: { [key: string]: string } = {
  comments: "💬",
  brain: "🧠",
  users: "👥",
  book: "📖",
  speech: "🗨️",
};

const Services: React.FC<ServicesProps> = ({ data }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any | null>(null);

  const openModal = (service: ServiceData) => {
    // Transform ServiceData to match Modal's expected format if necessary
    // Assuming Modal expects features as string[]
    const modalService = {
      ...service,
      icon: iconMap[service.icon] || service.icon || "🔧",
      features: service.features.map(f => f.text)
    };
    setSelectedService(modalService);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedService(null);
  };

  if (!data) return null;

  return (
    <section
      id="services"
      className="py-20 bg-white relative overflow-hidden"
      aria-labelledby="services-heading"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 border-2 border-primary rounded-full"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-secondary rounded-full"></div>
        <div className="absolute bottom-32 left-1/4 w-16 h-16 bg-accent rounded-full"></div>
        <div className="absolute bottom-20 right-1/3 w-20 h-20 border-2 border-secondary rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2
            id="services-heading"
            className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-dark mt-4 mb-6"
          >
            Çocuğunuz İçin
            <span className="text-gradient block">En İyi Hizmetler</span>
          </h2>
          <p className="font-body text-lg text-neutral-dark/80 max-w-3xl mx-auto leading-relaxed">
            Uzman kadromuz ve kanıta dayalı yöntemlerimizle, her çocuğun
            bireysel ihtiyaçlarına uygun özel eğitim ve rehabilitasyon
            hizmetleri sunuyoruz.
          </p>
        </div>

        {/* Services Slider */}
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-12 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
          {data.map((service, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] snap-center group bg-white rounded-3xl p-8 card-shadow hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 relative overflow-hidden"
            >
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10">
                {/* Icon */}
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:scale-110 transition-all duration-500">
                  <span className="text-4xl">{iconMap[service.icon] || service.icon || "🔧"}</span>
                </div>

                {/* Content */}
                <h3 className="font-display text-xl font-bold text-neutral-dark mb-4 group-hover:text-primary transition-colors duration-300">
                  {service.title}
                </h3>

                <p className="font-body text-neutral-dark/80 mb-6 leading-relaxed">
                  {service.description}
                </p>

                {/* Features */}
                <ul className="space-y-2">
                  {service.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className="flex items-center space-x-3"
                    >
                      <div className="w-2 h-2 bg-secondary rounded-full flex-shrink-0"></div>
                      <span className="font-body text-sm text-neutral-dark/70">
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Learn More Link */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <button onClick={() => openModal(service)} className="font-body text-primary font-semibold text-sm hover:text-primary/80 transition-colors duration-200 flex items-center space-x-2 group">
                    <span>Detayları Görün</span>
                    <svg
                      className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Decorative Element */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-secondary/20 to-accent/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          ))}
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal} service={selectedService} />
    </section>
  );
};

export default Services;