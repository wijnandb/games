import type { GameState } from '../types';
import { COLS, ROWS } from '../config';
import { renderParticles } from './particles';

const HUD_HEIGHT = 30;

function drawPolygon(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  radius: number, sides: number,
  rotation: number, color: string
) {
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const angle = rotation + (i * Math.PI * 2) / sides - Math.PI / 2;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
}

export function render(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  canvasW: number,
  canvasH: number
) {
  const cellW = canvasW / COLS;
  const cellH = canvasH / ROWS;

  ctx.save();

  // Screen shake
  if (state.shake.frames > 0) {
    const sx = (Math.random() - 0.5) * state.shake.intensity * 2;
    const sy = (Math.random() - 0.5) * state.shake.intensity * 2;
    ctx.translate(sx, sy);
  }

  // Background
  ctx.fillStyle = '#080810';
  ctx.fillRect(-10, -10, canvasW + 20, canvasH + 20);

  // Grid lines
  ctx.strokeStyle = '#111128';
  ctx.lineWidth = 1;
  for (let c = 0; c <= COLS; c++) {
    ctx.beginPath();
    ctx.moveTo(c * cellW, 0);
    ctx.lineTo(c * cellW, canvasH);
    ctx.stroke();
  }
  for (let r = 0; r <= ROWS; r++) {
    ctx.beginPath();
    ctx.moveTo(0, r * cellH);
    ctx.lineTo(canvasW, r * cellH);
    ctx.stroke();
  }

  // Path tiles (pulsing)
  const pulse = 0.04 + 0.06 * (0.5 + 0.5 * Math.sin(state.tick * 0.05));
  for (const cell of state.path) {
    ctx.fillStyle = `rgba(0, 180, 255, ${pulse})`;
    ctx.fillRect(cell.x * cellW, cell.y * cellH, cellW, cellH);
  }

  // Path center line
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.2)';
  ctx.shadowColor = '#00e5ff';
  ctx.shadowBlur = 8;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < state.path.length; i++) {
    const px = (state.path[i].x + 0.5) * cellW;
    const py = (state.path[i].y + 0.5) * cellH;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Hover preview
  if (state.hoverCell && !state.gameOver && !state.levelComplete) {
    const { col, row } = state.hoverCell;
    const canPlace =
      !state.pathCells.has(`${col},${row}`) &&
      !state.towers.some(t => t.col === col && t.row === row) &&
      col >= 0 && col < COLS && row >= 0 && row < ROWS;

    ctx.fillStyle = canPlace ? 'rgba(0, 255, 0, 0.25)' : 'rgba(255, 0, 0, 0.25)';
    ctx.fillRect(col * cellW, row * cellH, cellW, cellH);
  }

  // Towers
  for (const tower of state.towers) {
    // Base
    const baseW = cellW * 0.7;
    const baseH = cellH * 0.7;
    ctx.fillStyle = '#1a1a2e';
    ctx.strokeStyle = tower.color;
    ctx.lineWidth = 2;
    ctx.fillRect(tower.x - baseW / 2, tower.y - baseH / 2, baseW, baseH);
    ctx.strokeRect(tower.x - baseW / 2, tower.y - baseH / 2, baseW, baseH);

    // Turret (rotating diamond)
    drawPolygon(ctx, tower.x, tower.y, cellW * 0.2, 4, tower.rotation, tower.color);
  }

  // Enemies
  for (const enemy of state.enemies) {
    if (enemy.dead) continue;
    const radius = Math.min(cellW, cellH) * 0.3;
    drawPolygon(ctx, enemy.x, enemy.y, radius, enemy.sides, enemy.rotation, enemy.color);

    // HP bar
    const barW = cellW * 0.6;
    const barH = 3;
    const barX = enemy.x - barW / 2;
    const barY = enemy.y - radius - 6;
    const hpRatio = enemy.hp / enemy.maxHp;

    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = hpRatio > 0.5 ? '#00ff88' : hpRatio > 0.25 ? '#ffaa00' : '#ff2255';
    ctx.fillRect(barX, barY, barW * hpRatio, barH);
  }

  // Projectiles
  for (const p of state.projectiles) {
    // Trail
    for (let i = 0; i < p.trail.length; i++) {
      const alpha = (i + 1) / (p.trail.length + 1) * 0.5;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.trail[i].x, p.trail[i].y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Projectile
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Particles
  renderParticles(ctx);

  // HUD
  const hudY = 0;
  ctx.fillStyle = 'rgba(8, 8, 16, 0.85)';
  ctx.fillRect(0, hudY, canvasW, HUD_HEIGHT);
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, HUD_HEIGHT);
  ctx.lineTo(canvasW, HUD_HEIGHT);
  ctx.stroke();

  const fontSize = Math.max(10, Math.min(canvasW * 0.024, 15));
  ctx.font = `bold ${fontSize}px monospace`;
  ctx.textBaseline = 'middle';
  const cy = HUD_HEIGHT / 2;
  const spacing = canvasW / 4;

  // Lives
  ctx.fillStyle = state.lives > 5 ? '#00ff88' : '#ff2255';
  ctx.fillText(`\u2665 ${state.lives}`, 10, cy);

  // Money
  ctx.fillStyle = '#ffd700';
  ctx.fillText(`\u25C6 ${state.money}`, spacing, cy);

  // Wave
  ctx.fillStyle = '#00e5ff';
  const remaining = state.wave.total - state.wave.spawned + state.enemies.length;
  ctx.textAlign = 'center';
  ctx.fillText(`WAVE ${state.level}/50`, canvasW / 2, cy);

  // Enemies remaining
  ctx.textAlign = 'right';
  ctx.fillStyle = '#ff2d95';
  ctx.fillText(`\u25BC ${remaining}`, canvasW - 10, cy);
  ctx.textAlign = 'left';

  ctx.restore();
}
