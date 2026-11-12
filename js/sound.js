/* =========================================================
   音效与礼花庆祝引擎（纯前端 Web Audio + Canvas，无需外部音频文件）
   ========================================================= */
window.SoundFX = (function () {
  let ctx = null;
  let enabled = true;

  function initCtx() {
    if (!ctx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      ctx = new AudioCtx();
    }
    if (ctx && ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
  }

  function playTone(freq, type, duration, delay, gainVal) {
    if (!enabled) return;
    try {
      initCtx();
      if (!ctx) return;
      const now = ctx.currentTime + (delay || 0);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type || "sine";
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(gainVal || 0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      // 忽略部分浏览器自动播放限制异常
    }
  }

  return {
    setEnabled(val) {
      enabled = !!val;
    },
    isEnabled() {
      return enabled;
    },
    click() {
      playTone(580, "triangle", 0.06, 0, 0.08);
    },
    pop() {
      playTone(720, "sine", 0.09, 0, 0.11);
    },
    correct() {
      playTone(523.25, "triangle", 0.14, 0, 0.14);     // C5
      playTone(659.25, "triangle", 0.14, 0.09, 0.14);  // E5
      playTone(783.99, "triangle", 0.24, 0.18, 0.16);  // G5
      playTone(1046.5, "sine", 0.32, 0.27, 0.14);      // C6
    },
    wrong() {
      playTone(300, "sine", 0.16, 0, 0.12);
      playTone(240, "sine", 0.24, 0.12, 0.12);
    },
    fanfare() {
      const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
      const times = [0, 0.1, 0.2, 0.32, 0.46, 0.58];
      notes.forEach((n, i) => playTone(n, "triangle", 0.22, times[i], 0.15));
    }
  };
})();

window.ConfettiFX = (function () {
  let animId = null;

  return {
    burst() {
      const canvas = document.getElementById("confetti-canvas");
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const colors = ["#FF7A2F", "#3B82F6", "#10B981", "#F59E0B", "#EC4899", "#8B5CF6"];
      const particles = [];
      for (let i = 0; i < 85; i++) {
        particles.push({
          x: canvas.width * (0.2 + Math.random() * 0.6),
          y: canvas.height * 0.35,
          vx: (Math.random() - 0.5) * 14,
          vy: -Math.random() * 14 - 5,
          size: 7 + Math.random() * 7,
          color: colors[i % colors.length],
          rot: Math.random() * Math.PI * 2,
          vrot: (Math.random() - 0.5) * 0.25,
          gravity: 0.36
        });
      }

      if (animId) cancelAnimationFrame(animId);
      let frames = 0;

      function render() {
        frames++;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let alive = false;
        particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += p.gravity;
          p.rot += p.vrot;
          if (p.y < canvas.height + 30) alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.65);
          ctx.restore();
        });
        if (alive && frames < 160) {
          animId = requestAnimationFrame(render);
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
      render();
    }
  };
})();
