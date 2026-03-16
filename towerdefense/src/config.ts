import type { EnemyConfig, TowerConfig, PhotoConfig } from './types';

export const COLS = 14;
export const ROWS = 9;

export const WAYPOINTS: [number, number][] = [
  [0, 1], [3, 1], [3, 4], [7, 4], [7, 1], [10, 1], [10, 7], [13, 7],
];

export const ENEMY_TYPES: Record<string, EnemyConfig> = {
  basic: { type: 'basic', hp: 3, speed: 1.0, reward: 10, color: '#ff2d95', sides: 3 },
  fast:  { type: 'fast',  hp: 2, speed: 1.8, reward: 15, color: '#00ff88', sides: 4 },
  tank:  { type: 'tank',  hp: 8, speed: 0.5, reward: 25, color: '#ff8800', sides: 6 },
  boss:  { type: 'boss',  hp: 25, speed: 0.3, reward: 80, color: '#bf00ff', sides: 8 },
};

export const TOWER_TYPES: Record<string, TowerConfig> = {
  laser:  { type: 'laser',  cost: 50,  range: 3.0, damage: 1,   fireRate: 10, color: '#00e5ff' },
  cannon: { type: 'cannon', cost: 80,  range: 2.5, damage: 3,   fireRate: 4,  color: '#ff6600' },
  sniper: { type: 'sniper', cost: 120, range: 5.0, damage: 5,   fireRate: 2,  color: '#bf00ff' },
  frost:  { type: 'frost',  cost: 100, range: 2.5, damage: 0.5, fireRate: 7,  color: '#00ffcc', slows: 0.4 },
};

export const TOWER_ORDER = ['laser', 'cannon', 'sniper', 'frost'] as const;

export const PHOTOS: PhotoConfig[] = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  url: `https://picsum.photos/seed/bd${i + 1}/600/400`,
  caption: `Photo ${i + 1}`,
}));

export function getStartMoney(level: number): number {
  return 150 + level * 8;
}

export function getWaveSize(level: number): number {
  return 5 + Math.floor(level * 1.2);
}

export function getSpawnDelay(level: number): number {
  return level <= 4 ? 50 : 35;
}

export function getEnemyTypesForLevel(level: number): string[] {
  const types = ['basic'];
  if (level > 5) types.push('fast');
  if (level > 10) types.push('tank');
  return types;
}

export function generateWaveEnemy(level: number, index: number, total: number): string {
  const isBossLevel = level % 10 === 0;
  if (isBossLevel && index === total - 1) return 'boss';

  const available = getEnemyTypesForLevel(level);
  return available[Math.floor(Math.random() * available.length)];
}
