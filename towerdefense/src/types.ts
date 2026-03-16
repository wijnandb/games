export interface Point {
  x: number;
  y: number;
}

export interface EnemyConfig {
  type: string;
  hp: number;
  speed: number;
  reward: number;
  color: string;
  sides: number;
}

export interface TowerConfig {
  type: string;
  cost: number;
  range: number;
  damage: number;
  fireRate: number;
  color: string;
  slows?: number;
}

export interface Enemy {
  id: number;
  type: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  baseSpeed: number;
  reward: number;
  color: string;
  sides: number;
  pathIndex: number;
  pathProgress: number;
  rotation: number;
  slowTimer: number;
  dead: boolean;
}

export interface Tower {
  id: number;
  type: string;
  col: number;
  row: number;
  x: number;
  y: number;
  color: string;
  range: number;
  damage: number;
  fireRate: number;
  cooldown: number;
  rotation: number;
  slows?: number;
}

export interface Projectile {
  x: number;
  y: number;
  targetId: number;
  damage: number;
  speed: number;
  color: string;
  trail: Point[];
  slows?: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  active: boolean;
}

export interface ScreenShake {
  frames: number;
  intensity: number;
}

export interface GameState {
  level: number;
  money: number;
  lives: number;
  enemies: Enemy[];
  towers: Tower[];
  projectiles: Projectile[];
  particles: Particle[];
  path: Point[];
  pathCells: Set<string>;
  wave: {
    total: number;
    spawned: number;
    spawnTimer: number;
    spawnDelay: number;
    enemiesKilled: number;
  };
  nextId: number;
  shake: ScreenShake;
  gameOver: boolean;
  levelComplete: boolean;
  tick: number;
  hoverCell: { col: number; row: number } | null;
}

export interface PhotoConfig {
  id: number;
  url: string;
  caption: string;
}

export type Screen = 'menu' | 'game' | 'reward' | 'gallery';
