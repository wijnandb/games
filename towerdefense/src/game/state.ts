import type { GameState } from '../types';
import { getStartMoney, getWaveSize, getSpawnDelay } from '../config';
import { buildPath, buildPathCells } from './path';
import { resetParticles } from './particles';

export function createGame(level: number): GameState {
  const path = buildPath();
  const pathCells = buildPathCells(path);
  resetParticles();

  return {
    level,
    money: getStartMoney(level),
    lives: 20,
    enemies: [],
    towers: [],
    projectiles: [],
    particles: [],
    path,
    pathCells,
    wave: {
      total: getWaveSize(level),
      spawned: 0,
      spawnTimer: 0,
      spawnDelay: getSpawnDelay(level),
      enemiesKilled: 0,
    },
    nextId: 1,
    shake: { frames: 0, intensity: 0 },
    gameOver: false,
    levelComplete: false,
    tick: 0,
    hoverCell: null,
  };
}
