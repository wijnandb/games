import type { Point } from '../types';
import { WAYPOINTS, COLS, ROWS } from '../config';

export function buildPath(): Point[] {
  const path: Point[] = [];
  for (let i = 0; i < WAYPOINTS.length - 1; i++) {
    const [x1, y1] = WAYPOINTS[i];
    const [x2, y2] = WAYPOINTS[i + 1];
    const dx = Math.sign(x2 - x1);
    const dy = Math.sign(y2 - y1);
    let cx = x1, cy = y1;
    if (i === 0) path.push({ x: cx, y: cy });
    while (cx !== x2 || cy !== y2) {
      cx += dx;
      cy += dy;
      path.push({ x: cx, y: cy });
    }
  }
  return path;
}

export function buildPathCells(path: Point[]): Set<string> {
  const cells = new Set<string>();
  for (const p of path) {
    cells.add(`${p.x},${p.y}`);
  }
  return cells;
}

export function isValidPlacement(
  col: number,
  row: number,
  pathCells: Set<string>,
  towers: { col: number; row: number }[]
): boolean {
  if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return false;
  if (pathCells.has(`${col},${row}`)) return false;
  if (towers.some(t => t.col === col && t.row === row)) return false;
  return true;
}
