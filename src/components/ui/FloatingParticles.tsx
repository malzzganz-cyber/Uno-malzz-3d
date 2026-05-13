import { useEffect, useRef } from "react";

export function FloatingParticles() {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const particles: HTMLDivElement[] = [];
    const colors = ["rgba(139,92,246,0.6)", "rgba(0,255,255,0.4)", "rgba(59,130,246,0.5)", "rgba(16,185,129,0.4)"];
    for (let i = 0; i < 20; i++) {
      const p = document.createElement("div");
      const size = Math.random() * 6 + 2;
      p.style.cssText = `
        position: absolute;
        width: ${size}px; height: ${size}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation: float ${4 + Math.random() * 6}s ease-in-out infinite;
        animation-delay: ${Math.random() * 4}s;
        pointer-events: none;
      `;
      container.appendChild(p);
      particles.push(p);
    }
    return () => { particles.forEach((p) => p.remove()); };
  }, []);
  return <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none" />;
}
