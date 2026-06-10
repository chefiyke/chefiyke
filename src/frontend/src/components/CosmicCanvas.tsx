import { useEffect, useRef } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────

interface Particle {
  x: number;
  y: number;
  alpha: number;
  radius: number;
  decay: number;
}

interface Star {
  x: number;
  y: number;
  angle: number; // radians
  speed: number;
  length: number;
  alpha: number;
  particles: Particle[];
  done: boolean;
}

// ─── Gold palette ──────────────────────────────────────────────────────────
const GOLD_COLORS = ["#B8960C", "#C9A420", "#D4A90E", "#F0C93A"];

function randBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function createStar(width: number): Star {
  // Start anywhere along the top 40% of the canvas, left 70%
  const x = randBetween(0, width * 0.85);
  const y = randBetween(0, 80);
  const angle = randBetween(Math.PI / 8, Math.PI / 3.5); // ~22° – 51°
  return {
    x,
    y,
    angle,
    speed: randBetween(7, 11), // fast flash
    length: randBetween(55, 110),
    alpha: 1,
    particles: [],
    done: false,
  };
}

// ─── Component ─────────────────────────────────────────────────────────────

export function CosmicCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Respect prefers-reduced-motion
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    // Low-power mobile: skip if single/dual core
    const cores = navigator.hardwareConcurrency ?? 4;
    const isMobile = window.innerWidth < 768;
    if (isMobile && cores <= 2) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;
    canvas.width = width;
    canvas.height = height;

    const stars: Star[] = [];
    let lastSpawn = 0;
    // Interval: 3-6s desktop, 6-10s mobile
    const minInterval = isMobile ? 6000 : 3000;
    const maxInterval = isMobile ? 10000 : 6000;
    let nextSpawn = randBetween(minInterval, maxInterval);

    let rafId = 0;

    function spawnParticle(x: number, y: number): Particle {
      return {
        x: x + randBetween(-4, 4),
        y: y + randBetween(-4, 4),
        alpha: randBetween(0.5, 0.9),
        radius: randBetween(0.8, 2.0),
        decay: randBetween(0.018, 0.034),
      };
    }

    function drawFrame(timestamp: number) {
      ctx!.clearRect(0, 0, width, height);

      // Spawn logic — max 3 simultaneous stars
      if (stars.length < 3 && timestamp - lastSpawn > nextSpawn) {
        stars.push(createStar(width));
        lastSpawn = timestamp;
        nextSpawn = randBetween(minInterval, maxInterval);
      }

      for (let si = stars.length - 1; si >= 0; si--) {
        const s = stars[si];
        if (s.done) {
          stars.splice(si, 1);
          continue;
        }

        // Move head
        const dx = Math.cos(s.angle) * s.speed;
        const dy = Math.sin(s.angle) * s.speed;

        // Spawn particles along the trail
        if (Math.random() < 0.7) {
          s.particles.push(spawnParticle(s.x, s.y));
        }

        // Advance star position
        s.x += dx;
        s.y += dy;

        // Reduce alpha quickly — the flash should be brief
        s.alpha -= 0.04;
        if (s.alpha <= 0 || s.x > width || s.y > height) {
          s.done = true;
        }

        // Draw the streak (tail → head)
        const tailX = s.x - Math.cos(s.angle) * s.length;
        const tailY = s.y - Math.sin(s.angle) * s.length;
        const grad = ctx!.createLinearGradient(tailX, tailY, s.x, s.y);
        grad.addColorStop(0, "rgba(184,150,12,0)");
        grad.addColorStop(0.6, `rgba(201,164,32,${s.alpha * 0.5})`);
        grad.addColorStop(1, `rgba(240,201,58,${s.alpha})`);
        ctx!.beginPath();
        ctx!.moveTo(tailX, tailY);
        ctx!.lineTo(s.x, s.y);
        ctx!.strokeStyle = grad;
        ctx!.lineWidth = 1.2;
        ctx!.stroke();

        // Draw the bright head dot
        const headGrad = ctx!.createRadialGradient(s.x, s.y, 0, s.x, s.y, 3);
        headGrad.addColorStop(0, `rgba(240,201,58,${s.alpha})`);
        headGrad.addColorStop(1, "rgba(184,150,12,0)");
        ctx!.beginPath();
        ctx!.arc(s.x, s.y, 3, 0, Math.PI * 2);
        ctx!.fillStyle = headGrad;
        ctx!.fill();

        // Update and draw particles
        for (let pi = s.particles.length - 1; pi >= 0; pi--) {
          const p = s.particles[pi];
          p.alpha -= p.decay;
          if (p.alpha <= 0) {
            s.particles.splice(pi, 1);
            continue;
          }
          const color =
            GOLD_COLORS[Math.floor(Math.random() * GOLD_COLORS.length)];
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx!.fillStyle = `${color}${Math.round(p.alpha * 255)
            .toString(16)
            .padStart(2, "0")}`;
          ctx!.fill();
        }
      }

      rafId = requestAnimationFrame(drawFrame);
    }

    // Handle resize
    const onResize = () => {
      width = canvas!.offsetWidth;
      height = canvas!.offsetHeight;
      canvas!.width = width;
      canvas!.height = height;
    };
    window.addEventListener("resize", onResize, { passive: true });

    rafId = requestAnimationFrame(drawFrame);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    // biome-ignore lint/a11y/noAriaHiddenOnFocusable: decorative canvas, no meaningful content for AT
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
