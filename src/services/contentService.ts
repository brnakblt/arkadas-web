const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://127.0.0.1:1337";

export interface StrapiSingleResponse<T> {
  data: {
    id: number;
    attributes: T;
  };
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiCollectionResponse<T> {
  data: {
    id: number;
    attributes: T;
  }[];
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface Image {
  data: {
    id: number;
    attributes: {
      url: string;
      alternativeText: string;
      width: number;
      height: number;
    };
  } | null;
}

export interface ImageArray {
  data: {
    id: number;
    attributes: {
      url: string;
      alternativeText: string;
      width: number;
      height: number;
    };
  }[];
}

export interface HeroData {
  title: string;
  subtitle: string;
  description: string;
  images: ImageArray;
  stats: {
    id: number;
    value: string;
    label: string;
  }[];
}

export interface ServiceData {
  title: string;
  description: string;
  icon: string;
  slug: string;
  features: {
    id: number;
    text: string;
  }[];
}

export interface ProcessData {
  number: string;
  title: string;
  description: string;
  icon: string;
}

export interface FAQData {
  question: string;
  answer: string;
}

export interface GalleryData {
  title: string;
  category: string;
  alt: string;
  image: Image;
}

export const contentService = {
  async getHero(): Promise<StrapiSingleResponse<HeroData>> {
    const response = await fetch(`${STRAPI_URL}/api/hero?populate=images,stats`, {
      next: { revalidate: 60 },
    });
    if (!response.ok) throw new Error("Failed to fetch hero data");
    return response.json();
  },

  async getServices(): Promise<StrapiCollectionResponse<ServiceData>> {
    const response = await fetch(`${STRAPI_URL}/api/services?populate=features`, {
      next: { revalidate: 60 },
    });
    if (!response.ok) throw new Error("Failed to fetch services data");
    return response.json();
  },

  async getProcesses(): Promise<StrapiCollectionResponse<ProcessData>> {
    const response = await fetch(`${STRAPI_URL}/api/processes?sort=number:asc`, {
      next: { revalidate: 60 },
    });
    if (!response.ok) throw new Error("Failed to fetch processes data");
    return response.json();
  },

  async getFAQs(): Promise<StrapiCollectionResponse<FAQData>> {
    const response = await fetch(`${STRAPI_URL}/api/faqs`, {
      next: { revalidate: 60 },
    });
    if (!response.ok) throw new Error("Failed to fetch FAQs data");
    return response.json();
  },

  async getGallery(): Promise<StrapiCollectionResponse<GalleryData>> {
    const response = await fetch(`${STRAPI_URL}/api/galleries?populate=image`, {
      next: { revalidate: 60 },
    });
    if (!response.ok) throw new Error("Failed to fetch gallery data");
    return response.json();
  },
  
  getStrapiUrl(path: string) {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${STRAPI_URL}${path}`;
  }
};
