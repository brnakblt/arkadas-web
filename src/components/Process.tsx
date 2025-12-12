"use client";

import React, { useState, useRef, useLayoutEffect, createRef, useCallback } from "react";
import { ProcessData } from "@/services/contentService";

interface ProcessProps {
  data: ProcessData[];
}

const iconMap: { [key: string]: string } = {
  users: "👥",
  "clipboard-list": "📋",
  bullseye: "🚀",
  "user-friends": "👨‍👩‍👧‍👦",
  "chart-line": "📈",
  handshake: "🤝",
  chat: "💬",
  search: "🔍",
  map: "🗺️",
  "comments": "💬",
  "brain": "🧠",
};

const Process: React.FC<ProcessProps> = ({ data }) => {
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 });
  const [points, setPoints] = useState<Array<{ x: number; y: number }>>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  // Use data length for refs if data exists, otherwise 0
  const stepRefs = useRef((data || []).map(() => createRef<HTMLDivElement>()));

  // Update refs when data changes
  useLayoutEffect(() => {
    stepRefs.current = (data || []).map(() => createRef<HTMLDivElement>());
  }, [data]);

  const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    return (...args: Parameters<F>): void => {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => func(...args), waitFor);
    };
  };

  const updatePath = useCallback(() => {
    if (containerRef.current && data && data.length > 0) {
      const containerRect = containerRef.current.getBoundingClientRect();
      setSvgDimensions({ width: containerRect.width, height: containerRect.height });

      const newPoints = stepRefs.current.map(ref => {
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect();
          return {
            x: rect.left - containerRect.left + rect.width / 2,
            y: rect.top - containerRect.top + rect.height / 2,
          };
        }
        return { x: 0, y: 0 };
      });
      setPoints(newPoints);
    }
  }, [data]);

  useLayoutEffect(() => {
    updatePath();
    const debouncedUpdatePath = debounce(updatePath, 100);
    window.addEventListener("resize", debouncedUpdatePath);
    return () => {
      window.removeEventListener("resize", debouncedUpdatePath);
    };
  }, [updatePath]);

  const renderPath = () => {
    if (points.length !== 6) return null;

    const [p0, p1, p2, p3, p4, p5] = points;
    const midY = (p2.y + p3.y) / 2;

    const pathData = [
      `M ${p0.x} ${p0.y}`,
      `L ${p1.x} ${p1.y}`,
      `L ${p2.x} ${p2.y}`,
      `L ${p2.x} ${midY}`,
      `L ${p3.x} ${midY}`,
      `L ${p3.x} ${p3.y}`,
      `L ${p4.x} ${p4.y}`,
      `L ${p5.x} ${p5.y}`,
    ].join(" ");

    const lineColors = ["#7CB342", "#A5D6A7", "#F4A261"];

    return (
      <>
        <path d={pathData} stroke="#e0e0e0" strokeWidth="2" strokeDasharray="5, 5" fill="none" />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="5"
            fill={i < 3 ? lineColors[0] : lineColors[2]}
            className="animate-pulse"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </>
    );
  };

  if (!data) return null;

  return (
    <section
      id="process"
      className="py-20 bg-white relative overflow-hidden"
      aria-labelledby="process-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-dark mt-4 mb-6">
            Nasıl
            <span className="text-gradient block">Çalışıyoruz</span>
          </h2>
          <p className="font-body text-lg text-neutral-dark/80 max-w-3xl mx-auto leading-relaxed">
            Kanıta dayalı yöntemlerimiz ve sistematik yaklaşımımızla her çocuğun
            bireysel gelişim sürecini titizlikle planlıyor ve uyguluyoruz.
          </p>
        </div>

        <div className="relative" ref={containerRef}>
          <div className="hidden lg:block absolute inset-0 pointer-events-none z-0">
            <svg width={svgDimensions.width} height={svgDimensions.height} fill="none">
              {renderPath()}
            </svg>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-x-16 lg:gap-y-20 relative z-10">
            {data.map((step, index) => (
              <div
                key={index}
                ref={stepRefs.current[index]}
                className="group relative bg-white rounded-3xl p-8 card-shadow hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              >
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-xl border-4 border-white z-20">
                  <span className="font-display font-bold text-white text-xl">
                    {step.number}
                  </span>
                </div>
                <div className="text-5xl mb-6 mt-10 text-center filter drop-shadow-lg flex justify-center">
                  <span className="text-6xl">{iconMap[step.icon] || step.icon || "📄"}</span>
                </div>
                <h3 className="font-display text-xl font-bold text-neutral-dark mb-4 group-hover:text-primary transition-colors duration-300 text-center">
                  {step.title}
                </h3>
                <p className="font-body text-neutral-dark/80 leading-relaxed text-center">
                  {step.description}
                </p>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-accent/5 to-secondary/8 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            ))}
          </div>


        </div>
      </div>
    </section>
  );
};

export default Process;
