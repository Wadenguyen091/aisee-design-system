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
    let width = 0, height = 0, dpr = 1, cx = 0, cy = 0, radius = 0;
    let rings: Ring[] = [];
    const smoothGaze = { x: 0, y: 0, lastTime: 0 };

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

    const roundedRectDistance = (x: number, y: number, centerX: number, centerY: number, halfWidth: number, halfHeight: number) => {
      const corner = Math.min(halfWidth, halfHeight);
      const qx = Math.abs(x - centerX) - halfWidth + corner;
      const qy = Math.abs(y - centerY) - halfHeight + corner;
      return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - corner;
    };
    const blinkScale = (time: number) => {
      const phase = time % 6.4;
      const pulse = (center: number, width: number) => Math.max(0, 1 - Math.abs(phase - center) / width);
      return 1 - Math.max(pulse(2.82, .13), pulse(3.14, .09)) * .93;
    };
    const draw = (time: number) => {
      const delta = smoothGaze.lastTime ? Math.min(.05, time - smoothGaze.lastTime) : 0;
      smoothGaze.lastTime = time;
      const follow = still ? 1 : 1 - Math.exp(-delta * 7.5);
      smoothGaze.x += (gaze.current.x - smoothGaze.x) * follow;
      smoothGaze.y += (gaze.current.y - smoothGaze.y) * follow;
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
      const eyeCenterY = -.04 + smoothGaze.y * .1;
      const eyeOffsetX = smoothGaze.x * .12;
      const headCenterX = cx + smoothGaze.x * 8;
      const headCenterY = cy + smoothGaze.y * 6;
      const yaw = smoothGaze.x * .34 + Math.sin(time * .22) * .035;
      const pitch = smoothGaze.y * -.22 + Math.sin(time * .17) * .018;
      const yawCosine = Math.cos(yaw), yawSine = Math.sin(yaw);
      const pitchCosine = Math.cos(pitch), pitchSine = Math.sin(pitch);
      const latitudeSteps = width < 620 ? 24 : 35;
      const longitudeSteps = width < 620 ? 48 : 70;
      const points: Array<{ x: number; y: number; z: number; eye: number }> = [];
      for (let latitudeIndex = 1; latitudeIndex < latitudeSteps; latitudeIndex += 1) {
        const latitude = -Math.PI / 2 + latitudeIndex / latitudeSteps * Math.PI;
        const latitudeCosine = Math.cos(latitude);
        const latitudeSine = Math.sin(latitude);
        const stagger = latitudeIndex % 2 ? .5 : 0;
        for (let longitudeIndex = 0; longitudeIndex < longitudeSteps; longitudeIndex += 1) {
          const longitude = (longitudeIndex + stagger) / longitudeSteps * Math.PI * 2;
          const sourceX = latitudeCosine * Math.sin(longitude);
          const sourceY = latitudeSine;
          const sourceZ = latitudeCosine * Math.cos(longitude);
          const yawX = sourceX * yawCosine + sourceZ * yawSine;
          const yawZ = -sourceX * yawSine + sourceZ * yawCosine;
          const rotatedY = sourceY * pitchCosine - yawZ * pitchSine;
          const rotatedZ = sourceY * pitchSine + yawZ * pitchCosine;
          const perspective = 1 / (1.08 - rotatedZ * .08);
          const projectedX = yawX * perspective;
          const projectedY = rotatedY * perspective;
          const eyeDistance = Math.min(
            roundedRectDistance(projectedX, projectedY, -.22 + eyeOffsetX, eyeCenterY, .125, eyeHeight),
            roundedRectDistance(projectedX, projectedY, .22 + eyeOffsetX, eyeCenterY, .125, eyeHeight),
          );
          const eyeStrength = rotatedZ > .32 ? Math.max(0, Math.min(1, (.035 - eyeDistance) / .07)) : 0;
          points.push({ x: projectedX, y: projectedY, z: rotatedZ, eye: eyeStrength });
        }
      }
      points.sort((a, b) => a.z - b.z);
      for (const point of points) {
        const depth = (point.z + 1) / 2;
        const directionalLight = Math.max(0, point.z * .72 - point.x * .2 - point.y * .14);
        const baseAlpha = .025 + depth * .055 + directionalLight * .16;
        const alpha = baseAlpha + (.98 - baseAlpha) * point.eye;
        if (alpha < .02) continue;
        const pixel = 1.25 + depth * 1.7 + point.eye * 1.2;
        ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
        ctx.fillRect(headCenterX + point.x * radius - pixel / 2, headCenterY + point.y * radius - pixel / 2, pixel, pixel);
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
