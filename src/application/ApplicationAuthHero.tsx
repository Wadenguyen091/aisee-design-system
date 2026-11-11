import { useEffect, useRef } from 'react';

type Ring = { r: number; step: number; speed: number; alpha: number };

/** Brand hero for authentication surfaces, adapted from AISEE's original pixel-globe landing hero. */
export function ApplicationAuthHero({ title = 'Where your studio works with AI.', eyebrow = 'AISEE' }: { title?: string; eyebrow?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = canvas.current;
    const host = el?.parentElement;
    const ctx = el?.getContext('2d');
    if (!el || !host || !ctx) return;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = 0, height = 0, dpr = 1, cx = 0, cy = 0, radius = 0, cell = 6;
    let rings: Ring[] = [];

    const layout = () => {
      const box = host.getBoundingClientRect();
      const area = stage.current?.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = box.width;
      height = box.height;
      el.width = Math.round(width * dpr);
      el.height = Math.round(height * dpr);
      const top = area ? area.top - box.top : height * .48;
      const areaHeight = area ? area.height : height * .52;
      cx = width / 2;
      cy = top + areaHeight / 2;
      radius = Math.max(56, Math.min(116, (areaHeight - 32) / 2, width * .23));
      cell = width < 620 ? 5 : 6;
      const base = Math.max(radius * 1.85, Math.min(width, height * 1.2) * .3);
      rings = [1, 1.38, 1.8].map((scale, index) => ({ r: base * scale, step: 9 + index * 2, speed: (index % 2 ? -1 : 1) * (.012 + index * .004), alpha: .52 - index * .1 }));
    };

    const land = (x: number, y: number, z: number) => Math.sin(x * 3.1 + 1.3) * Math.sin(y * 2.6 - .4) * Math.cos(z * 2.9 + .7) + .55 * Math.sin(x * 6.3 + y * 4.1 + z * 2.2) + .3 * Math.cos(y * 9.5 - x * 3.3);
    const draw = (time: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      for (const ring of rings) {
        const count = Math.round((2 * Math.PI * ring.r) / ring.step);
        for (let index = 0; index < count; index += 1) {
          const angle = index / count * Math.PI * 2 + time * ring.speed;
          const side = Math.abs(Math.cos(angle));
          if (side < .55) continue;
          const x = cx + Math.cos(angle) * ring.r;
          const y = cy + Math.sin(angle) * ring.r * .92;
          if (y < 0 || y > height) continue;
          const fade = (side - .55) / .45;
          const bright = Math.sin(index * 1.7 + time * .9) + Math.sin(index * .31 - time * .5) > 1.55;
          ctx.fillStyle = `rgba(255,255,255,${(ring.alpha * fade * (bright ? 1.5 : .65)).toFixed(3)})`;
          const size = bright ? 2.6 : 1.8;
          ctx.fillRect(x - size / 2, y - size / 2, size, size);
        }
      }
      const turn = time * .18, cosine = Math.cos(turn), sine = Math.sin(turn);
      const tilt = -.35, tiltCosine = Math.cos(tilt), tiltSine = Math.sin(tilt);
      const pixel = cell * .62;
      for (let gridY = -radius; gridY <= radius; gridY += cell) for (let gridX = -radius; gridX <= radius; gridX += cell) {
        const normalizedX = gridX / radius, normalizedY = gridY / radius;
        const distance = normalizedX * normalizedX + normalizedY * normalizedY;
        if (distance > 1) continue;
        const normalizedZ = Math.sqrt(1 - distance);
        const tiltedY = normalizedY * tiltCosine - normalizedZ * tiltSine;
        const tiltedZ = normalizedY * tiltSine + normalizedZ * tiltCosine;
        const turnedX = normalizedX * cosine + tiltedZ * sine;
        const turnedZ = -normalizedX * sine + tiltedZ * cosine;
        const lit = land(turnedX, tiltedY, turnedZ) > .35;
        const shade = Math.max(0, normalizedX * -.45 + normalizedY * -.55 + normalizedZ * .7);
        const edge = 1 - Math.pow(distance, 3);
        const alpha = lit ? (.35 + .65 * shade) * edge : .07 * edge;
        if (alpha < .02) continue;
        ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
        ctx.fillRect(cx + gridX - pixel / 2, cy + gridY - pixel / 2, pixel, pixel);
      }
    };

    let frame = 0;
    const start = performance.now();
    const loop = () => { draw((performance.now() - start) / 1000); if (!still) frame = requestAnimationFrame(loop); };
    layout();
    loop();
    const observer = new ResizeObserver(() => { layout(); draw((performance.now() - start) / 1000); });
    observer.observe(host);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); };
  }, []);

  return <section className="application-auth-hero" aria-label={title}>
    <canvas ref={canvas} aria-hidden="true" />
    <div className="application-auth-hero__copy"><span>{eyebrow}</span><h1>{title}</h1></div>
    <div ref={stage} className="application-auth-hero__stage" aria-hidden="true" />
  </section>;
}
