import type { GameState, Enemy, Projectile } from '../types';
import { ENEMY_TYPES, COLS, ROWS, generateWaveEnemy } from '../config';
import { spawnParticles, updateParticles } from './particles';

export function update(state: GameState, cellW: number, cellH: number) {
  if (state.gameOver || state.levelComplete) return;
  state.tick++;

  // Spawn enemies
  if (state.wave.spawned < state.wave.total) {
    state.wave.spawnTimer++;
    if (state.wave.spawnTimer >= state.wave.spawnDelay) {
      state.wave.spawnTimer = 0;
      const typeName = generateWaveEnemy(state.level, state.wave.spawned, state.wave.total);
      const cfg = ENEMY_TYPES[typeName];
      const startCell = state.path[0];
      const levelScale = 1 + (state.level - 1) * 0.12;
      const enemy: Enemy = {
        id: state.nextId++,
        type: cfg.type,
        x: (startCell.x + 0.5) * cellW,
        y: (startCell.y + 0.5) * cellH,
        hp: cfg.hp * levelScale,
        maxHp: cfg.hp * levelScale,
        speed: cfg.speed,
        baseSpeed: cfg.speed,
        reward: cfg.reward,
        color: cfg.color,
        sides: cfg.sides,
        pathIndex: 0,
        pathProgress: 0,
        rotation: 0,
        slowTimer: 0,
        dead: false,
      };
      state.enemies.push(enemy);
      state.wave.spawned++;
    }
  }

  // Update enemies
  for (const e of state.enemies) {
    if (e.dead) continue;
    e.rotation += 0.03;

    // Slow effect
    if (e.slowTimer > 0) {
      e.slowTimer--;
      e.speed = e.baseSpeed * 0.6;
    } else {
      e.speed = e.baseSpeed;
    }

    // Move along path
    if (e.pathIndex < state.path.length - 1) {
      const target = state.path[e.pathIndex + 1];
      const tx = (target.x + 0.5) * cellW;
      const ty = (target.y + 0.5) * cellH;
      const dx = tx - e.x;
      const dy = ty - e.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const moveSpeed = e.speed * cellW * 0.03;

      if (dist < moveSpeed) {
        e.x = tx;
        e.y = ty;
        e.pathIndex++;
      } else {
        e.x += (dx / dist) * moveSpeed;
        e.y += (dy / dist) * moveSpeed;
      }
    }

    // Reached end
    if (e.pathIndex >= state.path.length - 1) {
      e.dead = true;
      state.lives--;
      state.shake = { frames: 10, intensity: 8 };
      if (state.lives <= 0) {
        state.gameOver = true;
      }
    }
  }

  // Tower firing
  for (const tower of state.towers) {
    tower.rotation += 0.02;
    if (tower.cooldown > 0) {
      tower.cooldown--;
      continue;
    }

    const rangePixels = tower.range * cellW;
    let bestEnemy: Enemy | null = null;
    let bestProgress = -1;

    for (const e of state.enemies) {
      if (e.dead) continue;
      const dx = e.x - tower.x;
      const dy = e.y - tower.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= rangePixels && e.pathIndex > bestProgress) {
        bestProgress = e.pathIndex;
        bestEnemy = e;
      }
    }

    if (bestEnemy) {
      tower.cooldown = Math.floor(60 / tower.fireRate);
      const proj: Projectile = {
        x: tower.x,
        y: tower.y,
        targetId: bestEnemy.id,
        damage: tower.damage,
        speed: 5,
        color: tower.color,
        trail: [],
        slows: tower.slows,
      };
      state.projectiles.push(proj);
    }
  }

  // Update projectiles
  for (let i = state.projectiles.length - 1; i >= 0; i--) {
    const p = state.projectiles[i];
    const target = state.enemies.find(e => e.id === p.targetId && !e.dead);

    if (!target) {
      state.projectiles.splice(i, 1);
      continue;
    }

    // Store trail
    p.trail.push({ x: p.x, y: p.y });
    if (p.trail.length > 5) p.trail.shift();

    const dx = target.x - p.x;
    const dy = target.y - p.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < p.speed + 4) {
      // Hit
      target.hp -= p.damage;
      if (p.slows) target.slowTimer = 60;
      spawnParticles(state.particles, p.x, p.y, p.color, 8, 2);

      if (target.hp <= 0) {
        target.dead = true;
        state.money += target.reward;
        state.wave.enemiesKilled++;
        state.shake = { frames: 5, intensity: 5 };
        spawnParticles(state.particles, target.x, target.y, target.color, 22, 4);
      }

      state.projectiles.splice(i, 1);
    } else {
      p.x += (dx / dist) * p.speed;
      p.y += (dy / dist) * p.speed;
    }
  }

  // Clean dead enemies
  state.enemies = state.enemies.filter(e => !e.dead);

  // Check level complete
  if (
    state.wave.spawned >= state.wave.total &&
    state.enemies.length === 0 &&
    !state.gameOver
  ) {
    state.levelComplete = true;
  }

  // Update particles
  updateParticles();

  // Screen shake decay
  if (state.shake.frames > 0) {
    state.shake.frames--;
  }
}
