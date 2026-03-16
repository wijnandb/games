import type { Particle } from '../types';

const MAX_PARTICLES = 500;
const pool: Particle[] = Array.from({ length: MAX_PARTICLES }, () => ({
  x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 1, color: '#fff', size: 3, active: false,
}));

export function spawnParticles(
  particles: Particle[],
  x: number, y: number,
  color: string,
  count: number,
  intensity: number = 3
) {
  let spawned = 0;
  for (const p of pool) {
    if (spawned >= count) break;
    if (!p.active) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (0.5 + Math.random() * intensity);
      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.life = 30 + Math.random() * 20;
      p.maxLife = p.life;
      p.color = color;
      p.size = 2 + Math.random() * 3;
      p.active = true;
      spawned++;
    }
  }
}

export function updateParticles() {
  for (const p of pool) {
    if (!p.active) continue;
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.04;
    p.vx *= 0.95;
    p.vy *= 0.95;
    p.life--;
    if (p.life <= 0) p.active = false;
  }
}

export function renderParticles(ctx: CanvasRenderingContext2D) {
  for (const p of pool) {
    if (!p.active) continue;
    const alpha = p.life / p.maxLife;
    const size = p.size * alpha;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
}

export function resetParticles() {
  for (const p of pool) {
    p.active = false;
  }
}
