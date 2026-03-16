import { useRef, useEffect, useCallback, useState } from 'react';
import type { GameState } from '../types';
import { COLS, ROWS, TOWER_TYPES, TOWER_ORDER } from '../config';
import { createGame } from '../game/state';
import { update } from '../game/update';
import { render } from '../game/render';
import { isValidPlacement } from '../game/path';
import { spawnParticles } from '../game/particles';

interface GameViewProps {
  level: number;
  onLevelComplete: () => void;
  onGameOver: () => void;
}

export default function GameView({ level, onLevelComplete, onGameOver }: GameViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<GameState>(createGame(level));
  const [selectedTower, setSelectedTower] = useState<string>('laser');
  const [money, setMoney] = useState(gameRef.current.money);
  const levelCompleteHandled = useRef(false);
  const gameOverHandled = useRef(false);

  // Reset game when level changes
  useEffect(() => {
    gameRef.current = createGame(level);
    levelCompleteHandled.current = false;
    gameOverHandled.current = false;
    setMoney(gameRef.current.money);
  }, [level]);

  const getCell = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const cellW = canvas.width / COLS;
    const cellH = canvas.height / ROWS;
    const col = Math.floor(x / cellW);
    const row = Math.floor(y / cellH);
    return { col, row };
  }, []);

  const placeTower = useCallback((col: number, row: number) => {
    const state = gameRef.current;
    const cfg = TOWER_TYPES[selectedTower];
    if (!cfg || state.money < cfg.cost) return;
    if (!isValidPlacement(col, row, state.pathCells, state.towers)) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const cellW = canvas.width / COLS;
    const cellH = canvas.height / ROWS;

    const tower = {
      id: state.nextId++,
      type: cfg.type,
      col, row,
      x: (col + 0.5) * cellW,
      y: (row + 0.5) * cellH,
      color: cfg.color,
      range: cfg.range,
      damage: cfg.damage,
      fireRate: cfg.fireRate,
      cooldown: 0,
      rotation: 0,
      slows: cfg.slows,
    };

    state.towers.push(tower);
    state.money -= cfg.cost;
    setMoney(state.money);
    spawnParticles(state.particles, tower.x, tower.y, tower.color, 12, 3);
  }, [selectedTower]);

  // Game loop
  useEffect(() => {
    let animId: number;
    const loop = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) { animId = requestAnimationFrame(loop); return; }

      const w = container.clientWidth;
      const h = container.clientHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        // Reposition towers when canvas resizes
        const cellW = w / COLS;
        const cellH = h / ROWS;
        for (const t of gameRef.current.towers) {
          t.x = (t.col + 0.5) * cellW;
          t.y = (t.row + 0.5) * cellH;
        }
      }

      const cellW = canvas.width / COLS;
      const cellH = canvas.height / ROWS;
      const state = gameRef.current;

      update(state, cellW, cellH);
      setMoney(state.money);

      const ctx = canvas.getContext('2d');
      if (ctx) render(ctx, state, canvas.width, canvas.height);

      if (state.levelComplete && !levelCompleteHandled.current) {
        levelCompleteHandled.current = true;
        setTimeout(onLevelComplete, 500);
      }
      if (state.gameOver && !gameOverHandled.current) {
        gameOverHandled.current = true;
        setTimeout(onGameOver, 1000);
      }

      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [level, onLevelComplete, onGameOver]);

  // Mouse events
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const cell = getCell(e.clientX, e.clientY);
    if (cell) gameRef.current.hoverCell = cell;
  }, [getCell]);

  const handleMouseLeave = useCallback(() => {
    gameRef.current.hoverCell = null;
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const cell = getCell(e.clientX, e.clientY);
    if (cell) placeTower(cell.col, cell.row);
  }, [getCell, placeTower]);

  // Touch events
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const cell = getCell(touch.clientX, touch.clientY);
    if (cell) gameRef.current.hoverCell = cell;
  }, [getCell]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const cell = getCell(touch.clientX, touch.clientY);
    if (cell) gameRef.current.hoverCell = cell;
  }, [getCell]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const state = gameRef.current;
    if (state.hoverCell) {
      placeTower(state.hoverCell.col, state.hoverCell.row);
      state.hoverCell = null;
    }
  }, [placeTower]);

  return (
    <div className="game-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#080810' }}>
      <div
        ref={containerRef}
        style={{ flex: 1, position: 'relative', touchAction: 'none', userSelect: 'none' }}
      >
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ display: 'block', width: '100%', height: '100%' }}
        />
      </div>
      <div className="tower-bar">
        {TOWER_ORDER.map(type => {
          const cfg = TOWER_TYPES[type];
          const affordable = money >= cfg.cost;
          const selected = selectedTower === type;
          return (
            <button
              key={type}
              onClick={() => setSelectedTower(type)}
              className="tower-btn"
              style={{
                borderColor: selected ? cfg.color : '#334',
                backgroundColor: selected ? `${cfg.color}38` : '#1a1a2e',
                color: affordable ? cfg.color : '#556',
                opacity: affordable ? 1 : 0.5,
              }}
            >
              <span className="tower-name">{cfg.type.toUpperCase()}</span>
              <span className="tower-cost">${cfg.cost}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
