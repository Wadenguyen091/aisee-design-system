import { useEffect, useRef, type PointerEvent } from 'react';

type Ring = { r: number; step: number; speed: number; alpha: number };

/** Brand hero for authentication surfaces, adapted from AISEE's original pixel-globe landing hero. */
export function ApplicationAuthHero({ title = 'Where your studio works with AI.', eyebrow = 'AISEE' }: { title?: string; eyebrow?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const gaze = useRef({ x: 0, y: 0 });

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

    const roundedRect = (x: number, y: number, centerX: number, centerY: number, halfWidth: number, halfHeight: number) => {
      const corner = Math.min(halfWidth, halfHeight);
      const qx = Math.abs(x - centerX) - halfWidth + corner;
      const qy = Math.abs(y - centerY) - halfHeight + corner;
      return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) <= corner;
    };
    const blinkScale = (time: number) => {
      const phase = time % 6.4;
      const pulse = (center: number, width: number) => Math.max(0, 1 - Math.abs(phase - center) / width);
      return 1 - Math.max(pulse(2.82, .13), pulse(3.14, .09)) * .93;
    };
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
      const eyeHeight = Math.max(.018, .24 * blinkScale(time));
      const eyeCenterY = -.04 + gaze.current.y * .055;
      const eyeOffsetX = gaze.current.x * .065;
      for (let gridY = -radius; gridY <= radius; gridY += cell) for (let gridX = -radius; gridX <= radius; gridX += cell) {
        const normalizedX = gridX / radius, normalizedY = gridY / radius;
        const distance = normalizedX * normalizedX + normalizedY * normalizedY;
        if (distance > 1) continue;
        const normalizedZ = Math.sqrt(1 - distance);
        const eye = roundedRect(normalizedX, normalizedY, -.22 + eyeOffsetX, eyeCenterY, .125, eyeHeight)
          || roundedRect(normalizedX, normalizedY, .22 + eyeOffsetX, eyeCenterY, .125, eyeHeight);
        const shade = Math.max(0, normalizedX * -.45 + normalizedY * -.55 + normalizedZ * .7);
        const edge = 1 - Math.pow(distance, 3);
        const alpha = (eye ? .98 : .08 + .22 * shade) * edge;
        if (alpha < .02) continue;
        const pixel = cell * (eye ? .72 : .54);
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

  const look = (event: PointerEvent<HTMLElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, (event.clientX - box.left) / box.width * 2 - 1));
    const y = Math.max(-1, Math.min(1, (event.clientY - box.top) / box.height * 2 - 1));
    gaze.current = { x, y };
  };

  const rest = () => { gaze.current = { x: 0, y: 0 }; };

  return <section className="application-auth-hero" aria-label={title} onPointerMove={look} onPointerLeave={rest}>
    <canvas ref={canvas} aria-hidden="true" />
    <div className="application-auth-hero__copy"><span>{eyebrow}</span><h1>{title}</h1></div>
    <div ref={stage} className="application-auth-hero__stage" aria-hidden="true" />
  </section>;
}
