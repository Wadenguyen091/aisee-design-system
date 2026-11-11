import { useEffect, useRef, type PointerEvent } from 'react';

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
    let width = 0, height = 0, dpr = 1, cx = 0, cy = 0, radius = 0;
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
      const base = Math.max(radius * 1.85, Math.min(width, height * 1.2) * .3);
      rings = [1, 1.38, 1.8].map((scale, index) => ({ r: base * scale, step: 9 + index * 2, speed: (index % 2 ? -1 : 1) * (.012 + index * .004), alpha: .52 - index * .1 }));
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
    event.currentTarget.style.setProperty('--aisee-look-x', `${(x * 5).toFixed(2)}px`);
    event.currentTarget.style.setProperty('--aisee-look-y', `${(y * 4).toFixed(2)}px`);
  };

  const rest = (event: PointerEvent<HTMLElement>) => {
    event.currentTarget.style.setProperty('--aisee-look-x', '0px');
    event.currentTarget.style.setProperty('--aisee-look-y', '0px');
  };

  return <section className="application-auth-hero" aria-label={title} onPointerMove={look} onPointerLeave={rest}>
    <canvas ref={canvas} aria-hidden="true" />
    <div className="application-auth-hero__copy"><span>{eyebrow}</span><h1>{title}</h1></div>
    <div ref={stage} className="application-auth-hero__stage" aria-hidden="true">
      <svg className="application-auth-agent" viewBox="0 0 240 220" role="presentation">
        <defs>
          <linearGradient id="aisee-agent-shell" x1="42" y1="30" x2="194" y2="194" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#D9D9D9" />
          </linearGradient>
          <filter id="aisee-agent-shadow" x="-40%" y="-40%" width="180%" height="200%">
            <feDropShadow dx="0" dy="16" stdDeviation="14" floodColor="#260000" floodOpacity=".42" />
          </filter>
        </defs>
        <g className="application-auth-agent__float" filter="url(#aisee-agent-shadow)">
          <path d="M120 22c48 0 82 31 82 77v31c0 43-35 78-78 78h-8c-43 0-78-35-78-78V99c0-46 34-77 82-77Z" fill="url(#aisee-agent-shell)" />
          <path d="M65 92c0-26 22-47 49-47h12c27 0 49 21 49 47v25c0 29-23 52-52 52h-6c-29 0-52-23-52-52V92Z" fill="#0A0A0A" />
          <path d="M40 104H29c-8 0-14 6-14 14v8c0 8 6 14 14 14h11v-36Zm160 0h11c8 0 14 6 14 14v8c0 8-6 14-14 14h-11v-36Z" fill="#F2F2F2" />
          <g className="application-auth-agent__eyes">
            <g className="application-auth-agent__eye application-auth-agent__eye--left">
              <rect x="82" y="83" width="25" height="38" rx="12.5" fill="#FFFFFF" />
              <circle className="application-auth-agent__pupil" cx="94.5" cy="103" r="5.5" fill="#0A0A0A" />
            </g>
            <g className="application-auth-agent__eye application-auth-agent__eye--right">
              <rect x="133" y="83" width="25" height="38" rx="12.5" fill="#FFFFFF" />
              <circle className="application-auth-agent__pupil" cx="145.5" cy="103" r="5.5" fill="#0A0A0A" />
            </g>
          </g>
          <path d="M105 141c9 7 21 7 30 0" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
          <circle cx="69" cy="133" r="5" fill="#E00000" opacity=".78" />
          <circle cx="171" cy="133" r="5" fill="#E00000" opacity=".78" />
          <path d="M120 22V9" stroke="#F2F2F2" strokeWidth="6" strokeLinecap="round" />
          <circle cx="120" cy="7" r="7" fill="#FFFFFF" />
        </g>
      </svg>
    </div>
  </section>;
}
