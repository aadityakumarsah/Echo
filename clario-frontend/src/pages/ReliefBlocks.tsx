/**
 * Space Blocks — a satisfying 3D tower-stacking game.
 * Tap / Space to drop the moving block onto the tower.
 * Blocks stack with perfect / partial / miss scoring.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import ReliefReport from "../components/ReliefReport";

const SESSION_SECONDS = 3 * 60;
const BLOCK_H = 24;
const COLORS = ["#A78BFA", "#60A5FA", "#34D399", "#F472B6", "#FBBF24", "#FB923C"];

interface Block {
  x: number;
  width: number;
  color: string;
  level: number;
}

function colorAt(level: number) {
  return COLORS[level % COLORS.length];
}

export default function ReliefBlocks() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    tower: [] as Block[],
    movingX: 0,
    movingDir: 1,
    movingWidth: 160,
    speed: 1.8,
    score: 0,
    streak: 0,
    gameOver: false,
  });
  const rafRef = useRef<number>(0);

  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);
  const [started, setStarted] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; color: string } | null>(null);

  // Timer
  useEffect(() => {
    if (!started || done || gameOver) return;
    const id = setInterval(() => {
      setElapsed((e) => {
        if (e + 1 >= SESSION_SECONDS) { setDone(true); return SESSION_SECONDS; }
        return e + 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [started, done, gameOver]);

  const showFeedback = (text: string, color: string) => {
    setFeedback({ text, color });
    setTimeout(() => setFeedback(null), 900);
  };

  const initGame = useCallback(() => {
    const canvas = canvasRef.current!;
    const W = canvas.width;
    const baseBlock: Block = { x: W / 2 - 80, width: 160, color: colorAt(0), level: 0 };
    stateRef.current = {
      tower: [baseBlock],
      movingX: 0,
      movingDir: 1,
      movingWidth: 160,
      speed: 1.8,
      score: 0,
      streak: 0,
      gameOver: false,
    };
    setScore(0);
    setStreak(0);
    setGameOver(false);
  }, []);

  const drop = useCallback(() => {
    const s = stateRef.current;
    if (s.gameOver || !started) return;

    const top = s.tower[s.tower.length - 1];
    const mX = s.movingX;
    const mW = s.movingWidth;

    // Overlap calculation
    const overlapLeft = Math.max(top.x, mX);
    const overlapRight = Math.min(top.x + top.width, mX + mW);
    const overlap = overlapRight - overlapLeft;

    if (overlap <= 4) {
      // Miss
      s.gameOver = true;
      s.streak = 0;
      setGameOver(true);
      setStreak(0);
      showFeedback("Miss!", "#F87171");
      return;
    }

    const newBlock: Block = {
      x: overlapLeft,
      width: overlap,
      color: colorAt(s.tower.length),
      level: s.tower.length,
    };
    s.tower.push(newBlock);
    s.movingWidth = overlap;
    s.score += Math.round(overlap);
    s.streak += 1;
    s.speed = Math.min(5.5, 1.8 + s.tower.length * 0.12);

    setScore(s.score);
    setStreak(s.streak);

    const perfect = Math.abs(overlap - top.width) < 3;
    showFeedback(perfect ? "Perfect! ✨" : s.streak > 4 ? `Streak ${s.streak}!` : "Nice", perfect ? "#34D399" : s.streak > 4 ? "#FBBF24" : "#A78BFA");
  }, [started]);

  // Key handler
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.code === "Space" || e.code === "Enter") { e.preventDefault(); drop(); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drop]);

  // Draw loop
  useEffect(() => {
    if (!started || gameOver || done) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const loop = () => {
      const s = stateRef.current;
      const W = canvas.width;
      const H = canvas.height;

      ctx.clearRect(0, 0, W, H);

      // Sky gradient
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "#0A0A18");
      grad.addColorStop(1, "#0F0E0C");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Stars
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      for (let i = 0; i < 40; i++) {
        const sx = ((i * 173 + 53) % 100) / 100 * W;
        const sy = ((i * 97 + 11) % 60) / 100 * H;
        ctx.beginPath();
        ctx.arc(sx, sy, 0.8, 0, Math.PI * 2);
        ctx.fill();
      }

      const baseY = H - 60;
      const visibleLevels = Math.min(s.tower.length, Math.floor((H - 120) / BLOCK_H));
      const startLevel = s.tower.length - visibleLevels;

      // Draw tower blocks
      s.tower.slice(startLevel).forEach((b, i) => {
        const level = startLevel + i;
        const y = baseY - (level - startLevel + 1) * BLOCK_H;
        const alpha = 0.55 + i / visibleLevels * 0.45;

        // Block shadow
        ctx.fillStyle = `rgba(0,0,0,0.3)`;
        ctx.fillRect(b.x + 4, y + 4, b.width, BLOCK_H - 2);

        // Block face
        ctx.fillStyle = b.color + Math.round(alpha * 255).toString(16).padStart(2, "0");
        ctx.fillRect(b.x, y, b.width, BLOCK_H - 2);

        // Top shine
        ctx.fillStyle = "rgba(255,255,255,0.12)";
        ctx.fillRect(b.x, y, b.width, 4);

        // 3D left face
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.beginPath();
        ctx.moveTo(b.x, y);
        ctx.lineTo(b.x - 8, y + 6);
        ctx.lineTo(b.x - 8, y + BLOCK_H + 4);
        ctx.lineTo(b.x, y + BLOCK_H - 2);
        ctx.fill();
      });

      // Moving block
      const topBlock = s.tower[s.tower.length - 1];
      const movingY = baseY - (s.tower.length - startLevel) * BLOCK_H - BLOCK_H;
      const mc = colorAt(s.tower.length);

      ctx.fillStyle = `rgba(0,0,0,0.25)`;
      ctx.fillRect(s.movingX + 4, movingY + 4, s.movingWidth, BLOCK_H - 2);
      ctx.fillStyle = mc + "cc";
      ctx.fillRect(s.movingX, movingY, s.movingWidth, BLOCK_H - 2);
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.fillRect(s.movingX, movingY, s.movingWidth, 4);

      // Ghost / alignment guide
      ctx.strokeStyle = mc + "44";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(topBlock.x, movingY, topBlock.width, BLOCK_H - 2);
      ctx.setLineDash([]);

      // Move the block
      const W2 = W;
      s.movingX += s.movingDir * s.speed;
      if (s.movingX + s.movingWidth > W2) { s.movingX = W2 - s.movingWidth; s.movingDir = -1; }
      if (s.movingX < 0) { s.movingX = 0; s.movingDir = 1; }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [started, gameOver, done]);

  const handleStart = () => {
    const canvas = canvasRef.current!;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    initGame();
    setStarted(true);
  };

  const timeLeft = SESSION_SECONDS - elapsed;
  const timeStr = `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, "0")}`;

  if (done) return <ReliefReport activity="blocks" duration={SESSION_SECONDS} score={score} onClose={() => navigate("/relief")} />;

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: "#0A0A18" }} onClick={drop}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 pt-4 pb-2"
        style={{ background: "linear-gradient(to bottom, rgba(10,10,24,0.9), transparent)" }}>
        <button onClick={(e) => { e.stopPropagation(); navigate("/relief"); }}
          className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.08)" }}>
          <X className="w-4 h-4 text-white" />
        </button>
        <div className="text-center">
          <div className="text-white font-bold text-xl tabular-nums">{score}</div>
          <div className="text-xs tabular-nums" style={{ color: "rgba(255,255,255,0.35)" }}>{timeStr}</div>
        </div>
        <div className="text-right">
          {streak > 1 && (
            <div className="text-xs font-semibold" style={{ color: "#FBBF24" }}>🔥 {streak}</div>
          )}
          <div className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>tap to drop</div>
        </div>
      </div>

      {/* Feedback toast */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.85 }}
            className="absolute top-20 left-1/2 z-30 px-4 py-2 rounded-full text-sm font-bold"
            style={{ x: "-50%", color: feedback.color, background: feedback.color + "22", border: `1px solid ${feedback.color}44` }}
          >
            {feedback.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Start overlay */}
      <AnimatePresence>
        {!started && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center"
            style={{ background: "rgba(10,10,24,0.85)" }}
          >
            <motion.div initial={{ y: 20 }} animate={{ y: 0 }} className="text-center px-8">
              <div className="text-5xl mb-4">🧱</div>
              <h2 className="text-2xl font-bold text-white mb-2">Space Blocks</h2>
              <p className="text-sm mb-2" style={{ color: "rgba(255,255,255,0.45)" }}>Stack blocks as high as you can</p>
              <p className="text-xs mb-8" style={{ color: "rgba(255,255,255,0.3)" }}>Tap screen · Space bar · Enter</p>
              <button
                onClick={(e) => { e.stopPropagation(); handleStart(); }}
                className="px-8 py-3 rounded-2xl text-white font-semibold text-sm"
                style={{ background: "rgba(167,139,250,0.2)", border: "1px solid rgba(167,139,250,0.4)" }}
              >
                Start Building
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game over overlay */}
      <AnimatePresence>
        {gameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center"
            style={{ background: "rgba(10,10,24,0.85)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div initial={{ y: 20 }} animate={{ y: 0 }} className="text-center px-8">
              <div className="text-4xl mb-3">💫</div>
              <h2 className="text-xl font-bold text-white mb-1">Tower Fell</h2>
              <p className="text-3xl font-bold mb-1" style={{ color: "#A78BFA" }}>{score}</p>
              <p className="text-xs mb-6" style={{ color: "rgba(255,255,255,0.35)" }}>total score</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => { handleStart(); }}
                  className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold"
                  style={{ background: "rgba(167,139,250,0.2)", border: "1px solid rgba(167,139,250,0.4)" }}
                >Try Again</button>
                <button
                  onClick={() => setDone(true)}
                  className="px-6 py-2.5 rounded-xl text-sm"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)" }}
                >See Report</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
