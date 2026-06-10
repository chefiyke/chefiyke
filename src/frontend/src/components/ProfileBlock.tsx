import { useEffect, useRef, useState } from "react";

export default function ProfileBlock() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      data-ocid="profile.section"
      className={`w-full py-16 md:py-20 transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
      style={{ background: "oklch(0.08 0 0)" }}
    >
      <div className="max-w-2xl mx-auto px-6 text-center">
        {/* Section label */}
        <p
          className="text-xs tracking-[0.35em] uppercase mb-6 font-semibold"
          style={{ color: "oklch(0.58 0.14 69)" }}
        >
          Profile
        </p>

        {/* Gold accent divider above name */}
        <div
          className="w-16 mx-auto mb-7"
          style={{
            height: "1px",
            background: "rgba(184, 150, 12, 0.4)",
          }}
        />

        {/* Primary name */}
        <h2
          className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-2 leading-tight"
          style={{ color: "oklch(0.97 0 0)" }}
        >
          Chefiyke
        </h2>

        {/* Title */}
        <p
          className="text-lg md:text-xl font-light italic mb-6 tracking-wide"
          style={{ color: "oklch(0.58 0.14 69)" }}
        >
          The King of Wealth
        </p>

        {/* Full name */}
        <p
          className="text-base md:text-lg mb-2 tracking-wide"
          style={{ color: "oklch(0.88 0 0)" }}
        >
          Ikechukwu J. Anago-Amanze
        </p>

        {/* Identity line */}
        <p
          className="text-sm tracking-[0.12em] mb-8"
          style={{ color: "oklch(0.62 0 0)" }}
        >
          Nigerian&nbsp;•&nbsp;Gemini
        </p>

        {/* Full-width gold divider */}
        <div
          className="mx-auto mb-8"
          style={{
            height: "1px",
            background: "rgba(184, 150, 12, 0.4)",
            maxWidth: "320px",
          }}
        />

        {/* Creative Identity label */}
        <p
          className="text-xs tracking-[0.3em] uppercase mb-3 font-semibold"
          style={{ color: "oklch(0.58 0.14 69)" }}
        >
          Creative Identity
        </p>

        {/* Tagline */}
        <p
          className="text-base md:text-lg font-light italic leading-relaxed"
          style={{ color: "oklch(0.92 0 0)" }}
        >
          Spirit-filled. Skill-driven. Built for impact.&nbsp;✨
        </p>
      </div>
    </section>
  );
}
