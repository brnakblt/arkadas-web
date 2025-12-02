"use client";

import { useEffect, useState } from 'react';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Team from '@/components/Team';
import Services from '@/components/Services';
import Process from '@/components/Process';
import Gallery from '@/components/Gallery';
import FAQ from '@/components/FAQ';
import Contact from '@/components/Contact';
import { contentService, HeroData, ServiceData, ProcessData, FAQData, GalleryData } from '@/services/contentService';

export default function Home() {
  const [heroData, setHeroData] = useState<HeroData | null>(null);
  const [servicesData, setServicesData] = useState<ServiceData[]>([]);
  const [processesData, setProcessesData] = useState<ProcessData[]>([]);
  const [faqData, setFaqData] = useState<FAQData[]>([]);
  const [galleryData, setGalleryData] = useState<GalleryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hero, services, processes, faq, gallery] = await Promise.all([
          contentService.getHero(),
          contentService.getServices(),
          contentService.getProcesses(),
          contentService.getFAQs(),
          contentService.getGallery(),
        ]);

        setHeroData(hero.data.attributes);
        setServicesData(services.data.map(item => item.attributes));
        setProcessesData(processes.data.map(item => item.attributes));
        setFaqData(faq.data.map(item => item.attributes));
        setGalleryData(gallery.data.map(item => item.attributes));
      } catch (error) {
        console.error("Error fetching content:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <>
      {heroData && <Hero data={heroData} />}
      <About />
      <Team />
      <Services data={servicesData} />
      <Process data={processesData} />
      <Gallery data={galleryData} />
      <FAQ data={faqData} />
      <Contact />
    </>
  );
}