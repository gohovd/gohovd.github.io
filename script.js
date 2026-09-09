// gohost.no — Games (Slot & Snake) with Leaderboards, High Score Names, View Toggle, Theme
(function () {
  "use strict";

  /* ==================================================================
     UTILITIES
     ================================================================== */
  const $ = (s, p) => (p || document).querySelector(s);
  const $$ = (s, p) => (p || document).querySelectorAll(s);

  $$(".year").forEach((el) => (el.textContent = new Date().getFullYear()));
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ==================================================================
     LEADERBOARDS & HIGH SCORES (localStorage with visitor names)
     ================================================================== */
  const LB_KEY = "gohost_leaderboards_v1";

  const DEFAULT_LEADERBOARDS = {
    slot: [
      { name: "LuckyGøran", score: 45, date: "Sep 2026" },
      { name: "HighRoller", score: 32, date: "Sep 2026" },
      { name: "Triple7", score: 25, date: "Sep 2026" },
      { name: "VegasBaby", score: 18, date: "Sep 2026" },
      { name: "Guest", score: 12, date: "Sep 2026" }
    ],
    snake: [
      { name: "Gøran", score: 20, date: "Sep 2026" },
      { name: "VimMaster", score: 15, date: "Sep 2026" },
      { name: "Pythonista", score: 11, date: "Sep 2026" },
      { name: "RetroGamer", score: 8, date: "Sep 2026" },
      { name: "Guest", score: 4, date: "Sep 2026" }
    ]
  };

  function loadLeaderboards() {
    try {
      const data = JSON.parse(localStorage.getItem(LB_KEY));
      if (data && data.slot && data.snake) return data;
    } catch (e) {
      // ignore
    }
    return JSON.parse(JSON.stringify(DEFAULT_LEADERBOARDS));
  }

  function saveLeaderboards(data) {
    try {
      localStorage.setItem(LB_KEY, JSON.stringify(data));
    } catch (e) {
      // storage full or private browsing
    }
  }

  function getLeaderboard(game) {
    const data = loadLeaderboards();
    return data[game] || [];
  }

  function qualifiesForLeaderboard(game, score) {
    if (score <= 0) return false;
    const list = getLeaderboard(game);
    if (list.length < 5) return true;
    return score > list[list.length - 1].score;
  }

  function addLeaderboardEntry(game, name, score) {
    const data = loadLeaderboards();
    const list = data[game] || [];
    const entryId = "entry_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4);
    const newEntry = {
      id: entryId,
      name: (name || "Visitor").trim().slice(0, 12),
      score: score,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })
    };
    list.push(newEntry);
    list.sort((a, b) => b.score - a.score);
    data[game] = list.slice(0, 5);
    saveLeaderboards(data);
    return entryId;
  }

  function renderLeaderboard(game, highlightId) {
    const listEl = $(`#${game}-lb-list`);
    if (!listEl) return;
    const list = getLeaderboard(game);
    listEl.innerHTML = "";

    const rankClasses = ["gold", "silver", "bronze", "", ""];

    list.forEach((item, idx) => {
      const li = document.createElement("li");
      if (item.id && item.id === highlightId) {
        li.classList.add("new-entry");
      }
      const rankSpan = document.createElement("span");
      rankSpan.className = `lb-rank ${rankClasses[idx] || ""}`;
      rankSpan.textContent = `#${idx + 1}`;

      const nameSpan = document.createElement("span");
      nameSpan.className = "lb-player";
      nameSpan.textContent = item.name;

      const scoreSpan = document.createElement("span");
      scoreSpan.className = "lb-score";
      scoreSpan.textContent = `${item.score} ${game === "slot" ? "pts" : "pts"}`;

      li.appendChild(rankSpan);
      li.appendChild(nameSpan);
      li.appendChild(scoreSpan);
      listEl.appendChild(li);
    });
  }

  function getBestScore(game) {
    const list = getLeaderboard(game);
    return list.length > 0 ? list[0].score : 0;
  }

  /* ==================================================================
     THEME (Solarized Light / Deep Dark)
     ================================================================== */
  const themeBtn = $("#theme-toggle");
  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.setAttribute(
    "data-theme",
    savedTheme === "dark" || (!savedTheme && prefersDark) ? "dark" : "light"
  );

  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const next =
        document.documentElement.getAttribute("data-theme") === "dark"
          ? "light"
          : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
    });
  }

  /* ==================================================================
     VIEW TOGGLE (Single-Page ↔ Scroll)
     ================================================================== */
  const viewSingle = $("#view-single");
  const viewScroll = $("#view-scroll");
  const viewBtn = $("#view-toggle");
  let currentView = "single";

  function setView(view) {
    currentView = view;
    if (view === "scroll") {
      viewSingle.hidden = true;
      viewScroll.hidden = false;
      document.body.classList.add("scroll-active");
      document.body.style.overflow = "";
      initScrollAnimations();
    } else {
      viewScroll.hidden = true;
      viewSingle.hidden = false;
      document.body.classList.remove("scroll-active");
      document.body.style.overflow = "hidden";
      animateSinglePageBars();
    }
  }

  if (viewBtn) {
    viewBtn.addEventListener("click", () => {
      setView(currentView === "single" ? "scroll" : "single");
    });
  }

  function animateSinglePageBars() {
    $$(".sp-ring .ring-fill").forEach((r) => r.classList.add("animated"));
  }

  /* ==================================================================
     SCROLL VIEW ANIMATIONS
     ================================================================== */
  let scrollInited = false;

  function initScrollAnimations() {
    if (scrollInited) return;
    scrollInited = true;

    const revealTargets = $$(
      "#view-scroll .tl-entry, #view-scroll .skill-group, #view-scroll .proj-card, #view-scroll .about-text"
    );
    revealTargets.forEach((el) => el.classList.add("reveal"));

    const revealObs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            revealObs.unobserve(e.target);
          }
        }),
      { threshold: 0.15 }
    );
    revealTargets.forEach((el) => revealObs.observe(el));

    const skillObs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.querySelectorAll(".skill-fill").forEach((b) => b.classList.add("animated"));
            e.target.querySelectorAll(".ring-fill").forEach((r) => r.classList.add("animated"));
            skillObs.unobserve(e.target);
          }
        }),
      { threshold: 0.2 }
    );
    $$("#view-scroll .skill-bars, #view-scroll .skill-rings").forEach((el) =>
      skillObs.observe(el)
    );

    const sections = $$("#view-scroll section[id]");
    const navLinks = $$("#nav-links-scroll a");
    const updateNav = () => {
      let cur = "";
      sections.forEach((s) => {
        if (window.scrollY >= s.offsetTop - 80) cur = s.id;
      });
      navLinks.forEach((a) =>
        a.classList.toggle("active", a.getAttribute("href") === `#${cur}`)
      );
    };
    window.addEventListener("scroll", updateNav, { passive: true });
  }

  /* ==================================================================
     GAME OVERLAY & DISMISSAL
     ================================================================== */
  const overlay = $("#game-overlay");
  const overlayHint = $("#overlay-hint");
  const slotEl = $("#slot-game");
  const snakeEl = $("#snake-game");

  let gameActive = true;
  let mouseMoveTotal = 0;
  const MOUSE_THRESHOLD = 180; // generous threshold to avoid accidental dismissal

  // Pick ONE random game on load
  const gameChoice = Math.random() < 0.5 ? "slot" : "snake";

  // Dismiss on mouse move or clicking the hint
  function isUserInputting() {
    const activeEl = document.activeElement;
    return activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA");
  }

  function onMouseMove(e) {
    if (!gameActive) return;
    if (isUserInputting()) return; // Never dismiss while visitor is typing their name!

    // If snake is actively moving, don't dismiss on small pointer moves
    if (gameChoice === "snake" && snakeState && snakeState.started && !snakeState.gameOver) {
      return;
    }

    mouseMoveTotal += Math.abs(e.movementX || 0) + Math.abs(e.movementY || 0);
    if (mouseMoveTotal >= MOUSE_THRESHOLD) {
      dismissGame();
    }
  }

  document.addEventListener("mousemove", onMouseMove);

  if (overlayHint) {
    overlayHint.addEventListener("click", dismissGame);
  }

  function dismissGame() {
    if (!gameActive) return;
    gameActive = false;
    document.removeEventListener("mousemove", onMouseMove);
    if (overlay) overlay.classList.add("hidden");

    if (gameChoice === "snake") stopSnake();
    if (gameChoice === "slot") stopSlot();

    setView("single");
  }

  /* ==================================================================
     SLOT MACHINE GAME
     ================================================================== */
  const SYMBOLS = ["🍒", "🍋", "🔔", "💎", "⭐", "🍊", "7️⃣"];
  let slotSpinning = false;
  let slotIntervals = [null, null, null];
  let slotStopped = false;
  let credits = 10;
  let peakCredits = 10;
  let slotSubmittedScore = false;

  function initSlotMachine() {
    credits = 10;
    peakCredits = 10;
    slotSpinning = false;
    slotStopped = false;
    slotSubmittedScore = false;

    updateSlotCreditsDisplay();
    renderLeaderboard("slot");

    // Leaderboard toggle
    const toggleBtn = $("#slot-lb-toggle");
    const wrap = $("#slot-lb-wrap");
    if (toggleBtn && wrap) {
      toggleBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        wrap.classList.toggle("collapsed");
        toggleBtn.textContent = wrap.classList.contains("collapsed") ? "Show" : "Hide";
      });
    }

    // Name Entry Form
    const nameForm = $("#slot-name-form");
    if (nameForm) {
      nameForm.addEventListener("submit", onSlotNameSubmit);
    }

    // Spin Button and Reels click
    const spinBtn = $("#slot-spin-btn");
    if (spinBtn) {
      spinBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        triggerSlotSpin();
      });
    }

    const reelsContainer = $("#slot-machine-reels");
    if (reelsContainer) {
      reelsContainer.addEventListener("click", (e) => {
        e.stopPropagation();
        triggerSlotSpin();
      });
    }

    document.addEventListener("keydown", onSlotKey);
  }

  function updateSlotCreditsDisplay() {
    const el = $("#slot-credits");
    if (el) el.textContent = credits;
  }

  function stopSlot() {
    slotStopped = true;
    slotIntervals.forEach((iv) => clearInterval(iv));
    document.removeEventListener("keydown", onSlotKey);
  }

  function onSlotKey(e) {
    if (isUserInputting()) return; // Don't trigger spin while typing name!
    if ((e.code !== "Space" && e.key !== " ") || slotSpinning || slotStopped) return;
    e.preventDefault();
    triggerSlotSpin();
  }

  function triggerSlotSpin() {
    if (slotSpinning || slotStopped) return;
    if (credits <= 0) {
      // Out of credits — restart with 10
      credits = 10;
      peakCredits = 10;
      slotSubmittedScore = false;
      const res = $("#slot-result");
      if (res) res.textContent = "Credits replenished! 🎰";
      updateSlotCreditsDisplay();
      return;
    }
    spinReels();
  }

  function spinReels() {
    slotSpinning = true;
    credits--;
    updateSlotCreditsDisplay();

    const result = $("#slot-result");
    if (result) result.textContent = "";

    const nameEntry = $("#slot-name-entry");
    if (nameEntry) nameEntry.hidden = true;

    const reels = [$("#reel-0"), $("#reel-1"), $("#reel-2")];
    const finalSymbols = [];

    reels.forEach((reel, i) => {
      if (!reel) return;
      reel.classList.add("spinning");
      slotIntervals[i] = setInterval(() => {
        reel.textContent = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      }, 60);
    });

    const stopDelays = [700, 1200, 1700];

    reels.forEach((reel, i) => {
      setTimeout(() => {
        if (slotStopped) return;
        clearInterval(slotIntervals[i]);
        if (reel) {
          reel.classList.remove("spinning");
          const sym = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
          reel.textContent = sym;
          finalSymbols.push(sym);
        }

        if (finalSymbols.length === 3) {
          slotSpinning = false;
          checkSlotResult(finalSymbols);
        }
      }, stopDelays[i]);
    });
  }

  function checkSlotResult(symbols) {
    const result = $("#slot-result");
    const isJackpot = symbols[0] === symbols[1] && symbols[1] === symbols[2];
    const isTwoMatch =
      symbols[0] === symbols[1] ||
      symbols[1] === symbols[2] ||
      symbols[0] === symbols[2];

    if (isJackpot) {
      credits += 15;
      if (result) result.textContent = "🎉 JACKPOT! +15 CREDITS!";
    } else if (isTwoMatch) {
      credits += 3;
      if (result) result.textContent = "✨ Nice Pair! +3 Credits";
    } else {
      if (result) {
        result.textContent = credits > 0 ? "Try again!" : "Game Over! Press Space to reset";
      }
    }

    updateSlotCreditsDisplay();
    peakCredits = Math.max(peakCredits, credits);

    // Check if peak credits qualify for leaderboard
    if (!slotSubmittedScore && qualifiesForLeaderboard("slot", peakCredits)) {
      const nameEntry = $("#slot-name-entry");
      const nameInput = $("#slot-name-input");
      if (nameEntry) {
        nameEntry.hidden = false;
        if (nameInput) {
          setTimeout(() => nameInput.focus(), 100);
        }
      }
    }
  }

  function onSlotNameSubmit(e) {
    e.preventDefault();
    const input = $("#slot-name-input");
    const nameEntry = $("#slot-name-entry");
    if (!input) return;

    const name = input.value.trim() || "Winner";
    const entryId = addLeaderboardEntry("slot", name, peakCredits);
    slotSubmittedScore = true;

    if (nameEntry) nameEntry.hidden = true;
    renderLeaderboard("slot", entryId);

    const wrap = $("#slot-lb-wrap");
    if (wrap) wrap.classList.remove("collapsed");

    const result = $("#slot-result");
    if (result) result.textContent = `Score saved for ${name}! 🏆`;
  }

  /* ==================================================================
     SNAKE GAME (with WASD / HJKL / Arrows & Leaderboard)
     ================================================================== */
  let snakeState = null;
  let snakeAnimFrame = null;
  let snakeKeyHandler = null;

  const KEY_MAP = {
    ArrowUp:    { x: 0, y: -1 },
    ArrowDown:  { x: 0, y:  1 },
    ArrowLeft:  { x: -1, y: 0 },
    ArrowRight: { x: 1,  y: 0 },
    w: { x: 0, y: -1 }, W: { x: 0, y: -1 }, KeyW: { x: 0, y: -1 },
    s: { x: 0, y:  1 }, S: { x: 0, y:  1 }, KeyS: { x: 0, y:  1 },
    a: { x: -1, y: 0 }, A: { x: -1, y: 0 }, KeyA: { x: -1, y: 0 },
    d: { x: 1,  y: 0 }, D: { x: 1,  y: 0 }, KeyD: { x: 1,  y: 0 },
    k: { x: 0, y: -1 }, K: { x: 0, y: -1 }, KeyK: { x: 0, y: -1 },
    j: { x: 0, y:  1 }, J: { x: 0, y:  1 }, KeyJ: { x: 0, y:  1 },
    h: { x: -1, y: 0 }, H: { x: -1, y: 0 }, KeyH: { x: -1, y: 0 },
    l: { x: 1,  y: 0 }, L: { x: 1,  y: 0 }, KeyL: { x: 1,  y: 0 },
  };

  function initSnake() {
    const canvas = $("#snake-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const CELL = 16;
    const COLS = canvas.width / CELL;
    const ROWS = canvas.height / CELL;
    const TICK_MS = 95; // snappy, responsive speed

    const initSnakeBody = () => [
      { x: Math.floor(COLS / 2), y: Math.floor(ROWS / 2) },
      { x: Math.floor(COLS / 2) - 1, y: Math.floor(ROWS / 2) },
      { x: Math.floor(COLS / 2) - 2, y: Math.floor(ROWS / 2) },
    ];

    snakeState = {
      snake: initSnakeBody(),
      dir: { x: 1, y: 0 }, // horizontally facing right initially
      inputQueue: [],      // input buffer for instant, queued turns (e.g. AW, WD)
      food: null,
      score: 0,
      lastTick: 0,
      gameOver: false,
      started: false,
      running: true,
      submittedScore: false
    };

    // Update best score display and leaderboard
    const bestEl = $("#snake-best");
    if (bestEl) bestEl.textContent = getBestScore("snake");
    renderLeaderboard("snake");

    // Leaderboard toggle
    const toggleBtn = $("#snake-lb-toggle");
    const wrap = $("#snake-lb-wrap");
    if (toggleBtn && wrap) {
      toggleBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        wrap.classList.toggle("collapsed");
        toggleBtn.textContent = wrap.classList.contains("collapsed") ? "Show" : "Hide";
      });
    }

    // Name Entry Form
    const nameForm = $("#snake-name-form");
    if (nameForm) {
      nameForm.addEventListener("submit", onSnakeNameSubmit);
    }

    function placeFood() {
      const s = snakeState;
      let pos;
      do {
        pos = {
          x: Math.floor(Math.random() * COLS),
          y: Math.floor(Math.random() * ROWS),
        };
      } while (s.snake.some((seg) => seg.x === pos.x && seg.y === pos.y));
      s.food = pos;
    }

    placeFood();

    function draw() {
      const s = snakeState;
      if (!s) return;

      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid
      ctx.strokeStyle = "rgba(51, 255, 51, 0.04)";
      ctx.lineWidth = 0.5;
      for (let x = 0; x <= canvas.width; x += CELL) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y <= canvas.height; y += CELL) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      // Food
      if (s.food) {
        ctx.fillStyle = "#ff3333";
        ctx.fillRect(s.food.x * CELL + 2, s.food.y * CELL + 2, CELL - 4, CELL - 4);
      }

      // Snake body
      s.snake.forEach((seg, i) => {
        ctx.fillStyle = i === 0 ? "#33ff33" : "#22bb22";
        ctx.fillRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2);
      });

      // Overlays
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      if (!s.started && !s.gameOver) {
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#33ff33";
        ctx.font = "bold 13px 'Courier New', monospace";
        ctx.fillText("SNAKE", canvas.width / 2, canvas.height / 2 - 14);
        ctx.font = "10px 'Courier New', monospace";
        ctx.fillStyle = "#88ee88";
        ctx.fillText("Arrows · WASD · HJKL to start", canvas.width / 2, canvas.height / 2 + 8);
      }

      if (s.gameOver) {
        ctx.fillStyle = "rgba(0,0,0,0.65)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ff5555";
        ctx.font = "bold 14px 'Courier New', monospace";
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = "11px 'Courier New', monospace";
        ctx.fillStyle = "#ffffff";
        ctx.fillText("Score: " + s.score, canvas.width / 2, canvas.height / 2);
        ctx.fillStyle = "#88ee88";
        ctx.fillText("Space to play again", canvas.width / 2, canvas.height / 2 + 18);
      }
    }

    function tick() {
      const s = snakeState;
      if (!s || s.gameOver || !s.started) return;

      // Consume next queued direction turn if available
      if (s.inputQueue.length > 0) {
        s.dir = s.inputQueue.shift();
      }

      const head = { x: s.snake[0].x + s.dir.x, y: s.snake[0].y + s.dir.y };

      // Wall collision
      if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
        handleSnakeGameOver();
        return;
      }

      // Self collision
      if (s.snake.some((seg) => seg.x === head.x && seg.y === head.y)) {
        handleSnakeGameOver();
        return;
      }

      s.snake.unshift(head);

      // Eat food
      if (s.food && head.x === s.food.x && head.y === s.food.y) {
        s.score++;
        const scoreEl = $("#snake-score");
        if (scoreEl) scoreEl.textContent = s.score;
        placeFood();
      } else {
        s.snake.pop();
      }
    }

    function handleSnakeGameOver() {
      const s = snakeState;
      s.gameOver = true;
      s.inputQueue = [];

      // Update best score
      const bestEl = $("#snake-best");
      const currentBest = getBestScore("snake");
      if (s.score > currentBest && bestEl) {
        bestEl.textContent = s.score;
      }

      // Check if qualifies for leaderboard
      if (!s.submittedScore && qualifiesForLeaderboard("snake", s.score)) {
        const nameEntry = $("#snake-name-entry");
        const nameInput = $("#snake-name-input");
        if (nameEntry) {
          nameEntry.hidden = false;
          if (nameInput) {
            setTimeout(() => nameInput.focus(), 100);
          }
        }
      }
    }

    function loop(timestamp) {
      if (!snakeState || !snakeState.running) return;
      if (timestamp - snakeState.lastTick >= TICK_MS) {
        tick();
        snakeState.lastTick = timestamp;
      }
      draw();
      snakeAnimFrame = requestAnimationFrame(loop);
    }

    draw();
    snakeAnimFrame = requestAnimationFrame(loop);

    snakeKeyHandler = function (e) {
      if (!snakeState || !snakeState.running) return;
      if (isUserInputting()) return; // Don't catch keys while visitor is typing their name!

      const s = snakeState;
      const key = e.key;

      // Restart on game over
      if (s.gameOver) {
        if (key === " " || key === "Spacebar" || e.code === "Space") {
          e.preventDefault();
          s.snake = initSnakeBody();
          s.dir = { x: 1, y: 0 };
          s.inputQueue = [];
          s.score = 0;
          s.gameOver = false;
          s.started = false;
          s.submittedScore = false;
          const scoreEl = $("#snake-score");
          if (scoreEl) scoreEl.textContent = "0";
          const nameEntry = $("#snake-name-entry");
          if (nameEntry) nameEntry.hidden = true;
          placeFood();
          draw();
        }
        return;
      }

      // Look up direction by key or code
      const mapped = KEY_MAP[key] || KEY_MAP[e.code];
      if (!mapped) return;
      e.preventDefault();

      // If not started, first directional key initiates game immediately
      if (!s.started) {
        // Prevent going directly backwards into initial body
        if (mapped.x === -1 && mapped.y === 0) return;
        s.started = true;
        s.dir = mapped;
        s.inputQueue = [];
        s.lastTick = performance.now();
        tick();
        draw();
        return;
      }

      // Reference direction is the last queued direction, or current moving direction
      const lastDir = s.inputQueue.length > 0 ? s.inputQueue[s.inputQueue.length - 1] : s.dir;

      // Ignore duplicate key press
      if (mapped.x === lastDir.x && mapped.y === lastDir.y) return;

      // Prevent 180° reverse turn against the pending movement
      if (mapped.x === -lastDir.x && mapped.y === -lastDir.y) return;

      // Buffer up to 2 turns for ultra-responsive double-turns (e.g. AW, WD, SA)
      if (s.inputQueue.length < 2) {
        s.inputQueue.push(mapped);
      }
    };

    document.addEventListener("keydown", snakeKeyHandler);
  }

  function onSnakeNameSubmit(e) {
    e.preventDefault();
    const input = $("#snake-name-input");
    const nameEntry = $("#snake-name-entry");
    if (!input || !snakeState) return;

    const name = input.value.trim() || "Player";
    const entryId = addLeaderboardEntry("snake", name, snakeState.score);
    snakeState.submittedScore = true;

    if (nameEntry) nameEntry.hidden = true;
    renderLeaderboard("snake", entryId);

    const wrap = $("#snake-lb-wrap");
    if (wrap) wrap.classList.remove("collapsed");
  }

  function stopSnake() {
    if (snakeState) snakeState.running = false;
    if (snakeAnimFrame) cancelAnimationFrame(snakeAnimFrame);
    if (snakeKeyHandler) document.removeEventListener("keydown", snakeKeyHandler);
  }

  /* ==================================================================
     INITIALIZE CHOSEN GAME
     ================================================================== */
  if (gameChoice === "slot") {
    if (slotEl) slotEl.classList.add("active");
    initSlotMachine();
  } else {
    if (snakeEl) snakeEl.classList.add("active");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        initSnake();
      });
    });
  }

})();
