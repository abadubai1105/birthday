import React, { useEffect, useRef, useState, useCallback } from "react";

/**
 * SorryDinnerInvite
 * Thiệp xin lỗi + mời đi ăn tối, có hiệu ứng pháo hoa/confetti khi bấm "đồng ý".
 *
 * Cách dùng: <SorryDinnerInvite />
 * Không cần props bắt buộc — người dùng tự điền tên ngay trên thiệp.
 */

const HEART_CHARS = ["💗", "💕", "💖", "💘", "❤️", "💝"];
const PARTICLE_COLORS = ["#ff5e7e", "#ff8fab", "#ffd166", "#ff3d68", "#ffffff", "#ff9fb3"];

const TEASE_MESSAGES = [
  "Nếu còn giận thì bấm vô đây",
  "Năn nỉ ó",
  "Năn nỉ ó 2 🍝",
  "Năn nỉ ó 9999 🙏",
  "Năn nỉ ó 10000000 🥺",
  "Let gâu 💗",
];

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

export default function SorryDinnerInvite() {
  const [nameMe, setNameMe] = useState("");
  const [nameYou, setNameYou] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [teaseIndex, setTeaseIndex] = useState(0);
  const [noShake, setNoShake] = useState(0); // bump to retrigger shake animation
  const [bgHearts, setBgHearts] = useState([]);
  const [heartBursts, setHeartBursts] = useState([]);

  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const confettiRef = useRef([]);
  const animationFrameRef = useRef(null);
  const fireworkIntervalRef = useRef(null);
  const confettiIntervalRef = useRef(null);
  const heartBurstIntervalRef = useRef(null);
  const yesBtnRef = useRef(null);
  const btnRowRef = useRef(null);
  const bgHeartIdRef = useRef(0);
  const burstIdRef = useRef(0);

  // ---------- Background floating hearts ----------
  useEffect(() => {
    const spawn = () => {
      const id = bgHeartIdRef.current++;
      const duration = randomBetween(6, 12);
      const heart = {
        id,
        char: HEART_CHARS[Math.floor(Math.random() * HEART_CHARS.length)],
        left: Math.random() * 100,
        duration,
        size: randomBetween(16, 36),
      };
      setBgHearts((prev) => [...prev, heart]);
      setTimeout(() => {
        setBgHearts((prev) => prev.filter((h) => h.id !== id));
      }, duration * 1000 + 500);
    };

    for (let i = 0; i < 6; i++) {
      setTimeout(spawn, i * 300);
    }
    const interval = setInterval(spawn, 600);
    return () => clearInterval(interval);
  }, []);

  // ---------- Canvas fireworks + confetti ----------
  const createFirework = useCallback((x, y) => {
    const count = 45;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
      const speed = randomBetween(2, 6);
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
        size: randomBetween(2, 4),
        gravity: 0.05,
      });
    }
  }, []);

  const createConfettiBatch = useCallback((n, canvas) => {
    for (let i = 0; i < n; i++) {
      confettiRef.current.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * canvas.height * 0.3,
        vx: randomBetween(-0.75, 0.75),
        vy: randomBetween(2, 5),
        size: randomBetween(6, 12),
        color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
        rot: Math.random() * 360,
        vrot: randomBetween(-5, 5),
        shape: Math.random() > 0.5 ? "rect" : "circle",
        alpha: 1,
      });
    }
  }, []);

  // Resize canvas to viewport
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Animation loop (always running, draws particles/confetti if present)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // fireworks particles
      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.alpha -= 0.015;
        ctx.globalAlpha = Math.max(p.alpha, 0);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      particlesRef.current = particlesRef.current.filter((p) => p.alpha > 0);

      // confetti
      confettiRef.current.forEach((c) => {
        c.x += c.vx;
        c.y += c.vy;
        c.rot += c.vrot;
        if (c.y > canvas.height + 30) c.alpha -= 0.04;
        ctx.globalAlpha = Math.max(c.alpha, 0);
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate((c.rot * Math.PI) / 180);
        ctx.fillStyle = c.color;
        if (c.shape === "rect") {
          ctx.fillRect(-c.size / 2, -c.size / 3, c.size, c.size * 0.6);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, c.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });
      confettiRef.current = confettiRef.current.filter(
        (c) => c.alpha > 0 && c.y < canvas.height + 60
      );

      ctx.globalAlpha = 1;
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const launchFireworksLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    fireworkIntervalRef.current = setInterval(() => {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height * 0.5 + 50;
      createFirework(x, y);
    }, 350);

    confettiIntervalRef.current = setInterval(() => {
      createConfettiBatch(12, canvas);
    }, 400);

    createConfettiBatch(60, canvas);
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height * 0.5 + 50;
        createFirework(x, y);
      }, i * 150);
    }
  }, [createFirework, createConfettiBatch]);

  const stopFireworksLoop = useCallback(() => {
    if (fireworkIntervalRef.current) {
      clearInterval(fireworkIntervalRef.current);
      fireworkIntervalRef.current = null;
    }
    if (confettiIntervalRef.current) {
      clearInterval(confettiIntervalRef.current);
      confettiIntervalRef.current = null;
    }
  }, []);

  // ---------- Heart burst on Yes button hover ----------
  const spawnHeartBurst = useCallback(() => {
    const btn = yesBtnRef.current;
    const row = btnRowRef.current;
    if (!btn || !row) return;

    const rect = btn.getBoundingClientRect();
    const rowRect = row.getBoundingClientRect();
    const id = burstIdRef.current++;

    const burst = {
      id,
      char: HEART_CHARS[Math.floor(Math.random() * HEART_CHARS.length)],
      left: rect.left - rowRect.left + Math.random() * rect.width,
      top: rect.top - rowRect.top + Math.random() * rect.height,
      tx: randomBetween(-60, 60),
      ty: -(randomBetween(60, 140)),
      rot: randomBetween(-30, 30),
    };

    setHeartBursts((prev) => [...prev, burst]);
    setTimeout(() => {
      setHeartBursts((prev) => prev.filter((b) => b.id !== id));
    }, 1000);
  }, []);

  const handleYesMouseEnter = () => {
    spawnHeartBurst();
    heartBurstIntervalRef.current = setInterval(spawnHeartBurst, 150);
  };
  const handleYesMouseLeave = () => {
    if (heartBurstIntervalRef.current) {
      clearInterval(heartBurstIntervalRef.current);
      heartBurstIntervalRef.current = null;
    }
  };
  const handleYesTouchStart = () => {
    for (let i = 0; i < 4; i++) setTimeout(spawnHeartBurst, i * 80);
  };

  useEffect(() => {
    return () => {
      if (heartBurstIntervalRef.current) clearInterval(heartBurstIntervalRef.current);
      stopFireworksLoop();
    };
  }, [stopFireworksLoop]);

  // ---------- Handlers ----------
  const handleCelebrate = () => {
    setShowSuccess(true);
    launchFireworksLoop();
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    stopFireworksLoop();
    particlesRef.current = [];
    confettiRef.current = [];
  };

  const handleTeaseNo = () => {
    setTeaseIndex((prev) => (prev + 1) % TEASE_MESSAGES.length);
    setNoShake((prev) => prev + 1);
  };

  const trimmedYou = nameYou.trim();
  const trimmedMe = nameMe.trim();

  const successTitle = trimmedYou
    ? `Yeahhh! Hẹn ${trimmedYou} ngày mai nha!`
    : "Yeahhh! Đi thoai tình iu ơi";

  const successText =
    trimmedMe && trimmedYou
      ? `Cảm ơn em đã tha thứ cho anh, ${trimmedYou} 💕`
      : "💕";

  return (
    <div style={styles.root}>
      <style>{cssAnimations}</style>

      {/* Floating background hearts */}
      <div style={styles.bgHearts} aria-hidden="true">
        {bgHearts.map((h) => (
          <div
            key={h.id}
            style={{
              ...styles.floatHeart,
              left: `${h.left}%`,
              fontSize: `${h.size}px`,
              animationDuration: `${h.duration}s`,
            }}
          >
            {h.char}
          </div>
        ))}
      </div>

      <div style={styles.wrap}>
        <div style={styles.card}>
          <div style={styles.iconRow}>💗</div>
          <h1 style={styles.h1}>Xin lỗi tình iu</h1>

          <div style={styles.divider} />

          <div style={styles.inviteBox}>
            <div style={styles.inviteLabel}>Lời mời đặc biệt</div>
            <div style={styles.inviteDetail}>
              🍽️ <span style={{ margin: "0 8px" }}>Bữa tối ngày mai</span> 🌙
            </div>
            <div style={{ ...styles.inviteDetail, fontSize: "0.95rem", marginTop: 4, fontWeight: 600, color: "#b23a4e" }}>
              lét gâu 🥂
            </div>
          </div>

          <div ref={btnRowRef} style={styles.btnRow}>
            {heartBursts.map((b) => (
              <div
                key={b.id}
                style={{
                  ...styles.heartBurst,
                  left: b.left,
                  top: b.top,
                  "--tx": `${b.tx}px`,
                  "--ty": `${b.ty}px`,
                  "--rot": `${b.rot}deg`,
                }}
              >
                {b.char}
              </div>
            ))}

            <button
              ref={yesBtnRef}
              onClick={handleCelebrate}
              onMouseEnter={handleYesMouseEnter}
              onMouseLeave={handleYesMouseLeave}
              onTouchStart={handleYesTouchStart}
              style={styles.yesBtn}
            >
              <span style={styles.yesBtnShimmer} aria-hidden="true" />
              Yes sirrrrrrr 🎉
            </button>

            <button
              onClick={handleTeaseNo}
              style={{
                ...styles.noBtn,
                animation: noShake ? "shakeNo 0.4s ease" : undefined,
              }}
              key={noShake} // retrigger animation each click
            >
              {TEASE_MESSAGES[teaseIndex]}
            </button>
          </div>

          <div style={styles.footerNote}>Hãy chọn nhóe tình iu 💌</div>
        </div>
      </div>

      <canvas ref={canvasRef} style={styles.canvas} />

      {showSuccess && (
        <div style={styles.successScreen}>
          <div style={styles.successInner}>
            <div style={styles.bigEmoji}>🥳</div>
            <h2 style={styles.successH2}>{successTitle}</h2>
            <p style={styles.successP}>{successText}</p>
            <button onClick={handleCloseSuccess} style={styles.closeSuccessBtn}>
              Đóng lại 💌
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Keyframes (kept as a <style> tag since inline styles can't do @keyframes) ----------
const cssAnimations = `
@keyframes floatUp {
  0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0; }
  10% { opacity: 0.6; }
  100% { transform: translateY(-110vh) translateX(20px) rotate(360deg); opacity: 0; }
}
@keyframes cardIn {
  from { opacity: 0; transform: translateY(40px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes pulseHeart {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}
@keyframes wiggleIcon {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-8deg); }
  75% { transform: rotate(8deg); }
}
@keyframes heartFly {
  0% { transform: translate(0,0) scale(0.6) rotate(0deg); opacity: 1; }
  100% { transform: translate(var(--tx), var(--ty)) scale(1.3) rotate(var(--rot)); opacity: 0; }
}
@keyframes shimmerMove {
  0% { left: -75%; }
  50% { left: 125%; }
  100% { left: 125%; }
}
@keyframes glowPulse {
  0%, 100% { box-shadow: 0 12px 25px -5px rgba(230,57,80,.55); }
  50% { box-shadow: 0 12px 35px 0px rgba(255,94,126,.85); }
}
@keyframes fadeIn {
  from { opacity: 0; } to { opacity: 1; }
}
@keyframes popIn {
  0% { transform: scale(0.6); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}
@keyframes shakeNo {
  0% { transform: translateX(0); }
  20% { transform: translateX(6px); }
  40% { transform: translateX(-6px); }
  60% { transform: translateX(4px); }
  80% { transform: translateX(-4px); }
  100% { transform: translateX(0); }
}
`;

// ---------- Styles ----------
const COLORS = {
  pink1: "#ff5e7e",
  pink2: "#ff8fab",
  red1: "#e63950",
};

const styles = {
  root: {
    position: "relative",
    minHeight: "100vh",
    width: "100%",
    fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
    background: "linear-gradient(160deg, #ffe3ea 0%, #ffc6d3 40%, #ff95ab 100%)",
    overflowX: "hidden",
  },
  bgHearts: {
    position: "fixed",
    inset: 0,
    pointerEvents: "none",
    zIndex: 0,
    overflow: "hidden",
  },
  floatHeart: {
    position: "absolute",
    bottom: "-50px",
    opacity: 0.55,
    animationName: "floatUp",
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
    color: COLORS.pink1,
    filter: "drop-shadow(0 0 4px rgba(255,255,255,.5))",
  },
  wrap: {
    position: "relative",
    zIndex: 1,
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "30px 16px",
  },
  card: {
    position: "relative",
    width: "100%",
    maxWidth: "480px",
    background: "rgba(255,255,255,0.85)",
    backdropFilter: "blur(10px)",
    borderRadius: "28px",
    padding: "42px 32px 36px",
    boxShadow: "0 25px 60px -10px rgba(230,57,80,.35), 0 0 0 1px rgba(255,255,255,.6) inset",
    textAlign: "center",
    animation: "cardIn 0.9s cubic-bezier(.16,1,.3,1) both",
    border: "1px solid rgba(255,255,255,.7)",
  },
  iconRow: {
    fontSize: "48px",
    marginBottom: "6px",
    animation: "pulseHeart 1.6s ease-in-out infinite, wiggleIcon 3s ease-in-out infinite",
    display: "inline-block",
  },
  h1: {
    fontFamily: "'Source Sans Pro', 'Segoe Script', cursive",
    fontSize: "2.4rem",
    color: COLORS.red1,
    marginBottom: "6px",
    letterSpacing: "0.5px",
  },
  subtitle: {
    fontSize: "0.95rem",
    color: "#b23a4e",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "2px",
    marginBottom: "22px",
    opacity: 0.8,
  },
  names: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "22px",
    fontSize: "1.15rem",
    fontWeight: 700,
    color: COLORS.red1,
  },
  nameInput: {
    border: "none",
    borderBottom: `2px dashed ${COLORS.pink2}`,
    background: "transparent",
    textAlign: "center",
    fontWeight: 700,
    color: COLORS.red1,
    fontSize: "1.05rem",
    width: "110px",
    padding: "4px 2px",
    fontFamily: "inherit",
    outline: "none",
  },
  heartSmall: {
    fontSize: "1.1rem",
    animation: "pulseHeart 1.2s ease-in-out infinite",
    display: "inline-block",
  },
  message: {
    fontSize: "1.05rem",
    lineHeight: 1.75,
    color: "#5a3540",
    marginBottom: "14px",
  },
  divider: {
    width: "60px",
    height: "3px",
    background: `linear-gradient(90deg, transparent, ${COLORS.pink1}, transparent)`,
    margin: "20px auto",
    borderRadius: "3px",
  },
  inviteBox: {
    background: "linear-gradient(135deg, #fff0f3, #ffe1e8)",
    border: `1.5px dashed ${COLORS.pink2}`,
    borderRadius: "18px",
    padding: "18px 16px",
    marginBottom: "26px",
  },
  inviteLabel: {
    fontSize: "0.8rem",
    letterSpacing: "1.5px",
    textTransform: "uppercase",
    color: COLORS.pink1,
    fontWeight: 700,
    marginBottom: "6px",
  },
  inviteDetail: {
    fontSize: "1.15rem",
    fontWeight: 700,
    color: "#7a2436",
  },
  btnRow: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    alignItems: "center",
    position: "relative",
  },
  heartBurst: {
    position: "absolute",
    pointerEvents: "none",
    fontSize: "18px",
    animation: "heartFly 1s ease-out forwards",
    zIndex: 5,
  },
  yesBtn: {
    width: "100%",
    padding: "16px 24px",
    fontSize: "1.1rem",
    color: "#fff",
    background: `linear-gradient(135deg, ${COLORS.red1}, ${COLORS.pink1})`,
    boxShadow: "0 12px 25px -5px rgba(230,57,80,.55)",
    position: "relative",
    overflow: "hidden",
    letterSpacing: "0.5px",
    animation: "glowPulse 2s ease-in-out infinite",
    cursor: "pointer",
    border: "none",
    fontWeight: 700,
    borderRadius: "50px",
    fontFamily: "inherit",
    transition: "transform .25s ease, box-shadow .25s ease",
  },
  yesBtnShimmer: {
    content: "''",
    position: "absolute",
    top: 0,
    left: "-75%",
    width: "50%",
    height: "100%",
    background: "linear-gradient(120deg, transparent, rgba(255,255,255,.6), transparent)",
    transform: "skewX(-25deg)",
    animation: "shimmerMove 2.6s ease-in-out infinite",
    display: "block",
    pointerEvents: "none",
  },
  noBtn: {
    background: "transparent",
    color: "#b23a4e",
    fontSize: "0.85rem",
    padding: "8px 14px",
    textDecoration: "underline",
    opacity: 0.6,
    transition: "opacity .3s ease",
    cursor: "pointer",
    border: "none",
    fontWeight: 700,
    borderRadius: "50px",
    fontFamily: "inherit",
  },
  footerNote: {
    marginTop: "22px",
    fontSize: "0.8rem",
    color: "#c97e8c",
    fontStyle: "italic",
  },
  canvas: {
    position: "fixed",
    inset: 0,
    zIndex: 40,
    pointerEvents: "none",
  },
  successScreen: {
    position: "fixed",
    inset: 0,
    zIndex: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "radial-gradient(circle at 50% 30%, rgba(255,209,220,.95), rgba(255,142,170,.97))",
    textAlign: "center",
    padding: "24px",
    animation: "fadeIn 0.5s ease both",
  },
  successInner: {
    background: "rgba(255,255,255,.9)",
    borderRadius: "28px",
    padding: "48px 32px",
    maxWidth: "420px",
    boxShadow: "0 30px 60px rgba(230,57,80,.4)",
    animation: "popIn 0.6s cubic-bezier(.34,1.56,.64,1) both",
  },
  bigEmoji: {
    fontSize: "4.5rem",
    marginBottom: "10px",
    animation: "bounce 1s ease infinite",
    display: "inline-block",
  },
  successH2: {
    fontFamily: "'Brush Script MT', 'Segoe Script', cursive",
    fontSize: "2.2rem",
    color: COLORS.red1,
    marginBottom: "10px",
  },
  successP: {
    color: "#7a2436",
    fontSize: "1.05rem",
    lineHeight: 1.6,
  },
  closeSuccessBtn: {
    marginTop: "24px",
    background: `linear-gradient(135deg, ${COLORS.red1}, ${COLORS.pink1})`,
    color: "#fff",
    padding: "10px 26px",
    borderRadius: "50px",
    fontSize: "0.9rem",
    border: "none",
    cursor: "pointer",
    fontWeight: 700,
    fontFamily: "inherit",
  },
};