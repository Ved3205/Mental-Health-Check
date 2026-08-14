(() => {
  "use strict";

  const API_URL = "https://mental-health-check-xqkb.onrender.com/predict";

  const form = document.getElementById("wellness-form");
  const submitBtn = document.getElementById("submit-btn");
  const resetBtn = document.getElementById("reset-btn");
  const retryBtn = document.getElementById("retry-btn");

  const states = {
    empty: document.getElementById("state-empty"),
    loading: document.getElementById("state-loading"),
    success: document.getElementById("state-success"),
    error: document.getElementById("state-error"),
  };

  const scoreValueEl = document.getElementById("score-value");
  const gaugeFillEl = document.getElementById("gauge-fill");
  const gaugeTicksEl = document.getElementById("gauge-ticks");
  const resultStatusEl = document.getElementById("result-status");
  const statusTextEl = document.getElementById("status-text");
  const resultExplainerEl = document.getElementById("result-explainer");
  const errorDetailEl = document.getElementById("error-detail");
  const stressGroup = document.getElementById("stress_level");

  /* -----------------------------------------------------------
     FIELD DEFINITIONS — mirrors the FastAPI contract exactly
  ----------------------------------------------------------- */
  const NUMERIC_FIELDS = [
    { name: "age", min: 10, max: 100, label: "Age" },
    { name: "avg_daily_usage_hours", min: 0, max: 24, label: "Average daily usage hours" },
    { name: "daily_unlocks", min: 0, max: null, label: "Daily phone unlocks" },
    { name: "study_hours", min: 0, max: 24, label: "Study hours" },
    { name: "physical_activity_hours", min: 0, max: 24, label: "Physical activity hours" },
    { name: "sleep_hours_per_night", min: 0, max: 24, label: "Sleep hours per night" },
  ];

  const SELECT_FIELDS = ["gender", "academic_level", "most_used_platform", "purpose_of_use"];

  let selectedStress = "";

  /* -----------------------------------------------------------
     STRESS SEGMENTED CONTROL
  ----------------------------------------------------------- */
  stressGroup.addEventListener("click", (e) => {
    const btn = e.target.closest(".segment");
    if (!btn) return;
    selectedStress = btn.dataset.value;
    stressGroup.querySelectorAll(".segment").forEach((seg) => {
      seg.setAttribute("aria-checked", String(seg === btn));
    });
    clearFieldError("stress_level");
  });

  stressGroup.addEventListener("keydown", (e) => {
    const segments = Array.from(stressGroup.querySelectorAll(".segment"));
    const currentIndex = segments.findIndex((s) => s === document.activeElement);
    if (currentIndex === -1) return;

    let nextIndex = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") nextIndex = (currentIndex + 1) % segments.length;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") nextIndex = (currentIndex - 1 + segments.length) % segments.length;

    if (nextIndex !== null) {
      e.preventDefault();
      segments[nextIndex].focus();
      segments[nextIndex].click();
    }
  });

  /* -----------------------------------------------------------
     VALIDATION
  ----------------------------------------------------------- */
  function setFieldError(name, message) {
    const wrapper = document.getElementById(name)?.closest(".field") ||
      (name === "stress_level" ? document.getElementById(name).closest(".field") : null);
    const errorEl = document.getElementById(`${name}-error`);
    if (wrapper) wrapper.classList.add("has-error");
    if (errorEl) errorEl.textContent = message;
  }

  function clearFieldError(name) {
    const wrapper = document.getElementById(name)?.closest(".field") ||
      (name === "stress_level" ? document.getElementById(name).closest(".field") : null);
    const errorEl = document.getElementById(`${name}-error`);
    if (wrapper) wrapper.classList.remove("has-error");
    if (errorEl) errorEl.textContent = "";
  }

  function clearAllErrors() {
    document.querySelectorAll(".field").forEach((f) => f.classList.remove("has-error"));
    document.querySelectorAll(".field-error").forEach((e) => (e.textContent = ""));
  }

  function validateForm(data) {
    let firstInvalid = null;
    let isValid = true;

    const flag = (name, message) => {
      setFieldError(name, message);
      isValid = false;
      if (!firstInvalid) firstInvalid = name;
    };

    NUMERIC_FIELDS.forEach(({ name, min, max, label }) => {
      const raw = data[name];
      if (raw === "" || raw === null || raw === undefined || Number.isNaN(Number(raw))) {
        flag(name, `${label} is required.`);
        return;
      }
      const value = Number(raw);
      if (min !== null && value < min) {
        flag(name, `${label} must be at least ${min}.`);
        return;
      }
      if (max !== null && value > max) {
        flag(name, `${label} must be ${max} or less.`);
      }
    });

    SELECT_FIELDS.forEach((name) => {
      if (!data[name]) flag(name, "Please make a selection.");
    });

    if (!data.country || !data.country.trim()) {
      flag("country", "Please enter your country.");
    }

    if (!data.stress_level) {
      flag("stress_level", "Please choose your stress level.");
    }

    return { isValid, firstInvalid };
  }

  /* -----------------------------------------------------------
     GAUGE
  ----------------------------------------------------------- */
  function buildTicks() {
    if (gaugeTicksEl.childElementCount > 0) return;
    const cx = 120, cy = 130, rInner = 100, rOuter = 110;
    const steps = 3; // 0, 5, 10 — kept minimal on purpose
    for (let i = 0; i < steps; i++) {
      const f = i / (steps - 1);
      const theta = (Math.PI * (1 - f)); // 180deg -> 0deg in radians
      const x1 = cx + rInner * Math.cos(theta);
      const y1 = cy - rInner * Math.sin(theta);
      const x2 = cx + rOuter * Math.cos(theta);
      const y2 = cy - rOuter * Math.sin(theta);
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", x1.toFixed(2));
      line.setAttribute("y1", y1.toFixed(2));
      line.setAttribute("x2", x2.toFixed(2));
      line.setAttribute("y2", y2.toFixed(2));
      gaugeTicksEl.appendChild(line);
    }
  }

  function bandForScore(score) {
    if (score < 4) return { key: "strained", label: "Signal: strained" };
    if (score < 7) return { key: "balanced", label: "Signal: balanced" };
    return { key: "strong", label: "Signal: strong" };
  }

  const EXPLAINERS = {
    strained: "Your recent habits point to real strain — sleep, stress, or screen time may be pulling on your energy. Small, consistent changes usually help more than big overhauls.",
    balanced: "Your signal sits in a steady middle ground. There's room to fine-tune sleep, activity, or screen time, but nothing here looks alarming.",
    strong: "Your habits are working in your favor right now. Sleep, activity, and stress appear well balanced — keep an eye on what's supporting that.",
  };

  // Presentation-only: eases the displayed number toward the new score
  // instead of snapping to it. Does not touch banding, status, or any
  // state-machine logic — purely a cosmetic readout of the same value.
  let lastScoreValue = 0;
  const prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function animateScoreNumber(target, duration = 900) {
    if (prefersReducedMotion) {
      scoreValueEl.textContent = target.toFixed(2);
      lastScoreValue = target;
      return;
    }
    const start = lastScoreValue;
    const startTime = performance.now();
    function tick(now) {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (target - start) * eased;
      scoreValueEl.textContent = current.toFixed(2);
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        lastScoreValue = target;
      }
    }
    requestAnimationFrame(tick);
  }

  function renderGauge(score) {
    const clamped = Math.max(0, Math.min(10, score));
    const fraction = clamped / 10;
    const offset = 100 - fraction * 100;

    gaugeFillEl.classList.remove("band-strained", "band-balanced", "band-strong");
    resultStatusEl.classList.remove("band-strained", "band-balanced", "band-strong");

    const band = bandForScore(clamped);
    gaugeFillEl.classList.add(`band-${band.key}`);
    resultStatusEl.classList.add(`band-${band.key}`);

    // Force reflow so the transition replays every time
    gaugeFillEl.style.transition = "none";
    gaugeFillEl.style.strokeDashoffset = "100";
    void gaugeFillEl.getBoundingClientRect();
    gaugeFillEl.style.transition = "";
    requestAnimationFrame(() => {
      gaugeFillEl.style.strokeDashoffset = String(offset);
    });

    animateScoreNumber(score);
    statusTextEl.textContent = band.label;
    resultExplainerEl.textContent = EXPLAINERS[band.key];
  }

  /* -----------------------------------------------------------
     STATE SWITCHING
     Single authoritative status — exactly one of these is ever
     active, and every other panel is force-hidden every time this
     runs, so no two states can render at once.
  ----------------------------------------------------------- */
  let currentStatus = "idle"; // "idle" | "loading" | "success" | "error"
  const STATE_EL_BY_STATUS = {
    idle: states.empty,
    loading: states.loading,
    success: states.success,
    error: states.error,
  };

  function showState(status) {
    currentStatus = status;
    Object.values(STATE_EL_BY_STATUS).forEach((el) => {
      el.hidden = true;
    });
    STATE_EL_BY_STATUS[status].hidden = false;
  }

  function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    submitBtn.classList.toggle("is-loading", isLoading);
  }

  /* -----------------------------------------------------------
     FORM COLLECTION
  ----------------------------------------------------------- */
  function collectFormData() {
    const fd = new FormData(form);
    return {
      age: fd.get("age"),
      gender: fd.get("gender") || "",
      country: (fd.get("country") || "").toString().trim(),
      academic_level: fd.get("academic_level") || "",
      most_used_platform: fd.get("most_used_platform") || "",
      purpose_of_use: fd.get("purpose_of_use") || "",
      avg_daily_usage_hours: fd.get("avg_daily_usage_hours"),
      daily_unlocks: fd.get("daily_unlocks"),
      study_hours: fd.get("study_hours"),
      physical_activity_hours: fd.get("physical_activity_hours"),
      sleep_hours_per_night: fd.get("sleep_hours_per_night"),
      stress_level: selectedStress,
    };
  }

  function buildPayload(data) {
    return {
      age: parseInt(data.age, 10),
      gender: data.gender,
      country: data.country,
      academic_level: data.academic_level,
      most_used_platform: data.most_used_platform,
      purpose_of_use: data.purpose_of_use,
      avg_daily_usage_hours: parseFloat(data.avg_daily_usage_hours),
      daily_unlocks: parseInt(data.daily_unlocks, 10),
      study_hours: parseFloat(data.study_hours),
      physical_activity_hours: parseFloat(data.physical_activity_hours),
      sleep_hours_per_night: parseFloat(data.sleep_hours_per_night),
      stress_level: data.stress_level,
    };
  }

  /* -----------------------------------------------------------
     SUBMIT
     `lastPayload` is the only piece of state retry needs — it is
     set once, right before the first request, and reused by
     "Try again" so a retry re-sends the same check-in instead of
     bouncing the person back to idle.
  ----------------------------------------------------------- */
  let lastPayload = null;

  async function runPrediction(payload) {
    setLoading(true);
    showState("loading");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let detail = "";
        try {
          const errBody = await response.json();
          detail = typeof errBody?.detail === "string" ? errBody.detail : JSON.stringify(errBody?.detail || "");
        } catch (_) {
          /* ignore parse failure */
        }
        throw new Error(detail || `Request failed with status ${response.status}`);
      }

      const result = await response.json();
      const score = Number(result.predicted_mental_health_score);

      if (Number.isNaN(score)) {
        throw new Error("Unexpected response from the prediction service.");
      }

      // Score only ever comes from a resolved, successful response —
      // the error path below never touches the gauge or score text.
      buildTicks();
      renderGauge(score);
      showState("success");
    } catch (err) {
      console.error("Prediction request failed:", err);
      errorDetailEl.textContent = err && err.message ? err.message : "";
      showState("error");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    clearAllErrors();

    const data = collectFormData();
    const { isValid, firstInvalid } = validateForm(data);

    if (!isValid) {
      const target = document.getElementById(firstInvalid);
      if (target && typeof target.focus === "function") {
        target.focus();
      } else if (firstInvalid === "stress_level") {
        stressGroup.querySelector(".segment")?.focus();
      }
      return;
    }

    lastPayload = buildPayload(data);
    await runPrediction(lastPayload);
  }

  /* -----------------------------------------------------------
     RESET / RETRY
  ----------------------------------------------------------- */
  function resetCheckIn() {
    form.reset();
    clearAllErrors();
    selectedStress = "";
    stressGroup.querySelectorAll(".segment").forEach((seg) => seg.setAttribute("aria-checked", "false"));
    lastPayload = null;
    showState("idle");
  }

  function handleRetry() {
    if (!lastPayload) {
      // No prior submission to replay (e.g. state was reached some
      // other way) — fall back to idle rather than guessing values.
      showState("idle");
      return;
    }
    runPrediction(lastPayload);
  }

  form.addEventListener("submit", handleSubmit);
  resetBtn.addEventListener("click", resetCheckIn);
  retryBtn.addEventListener("click", handleRetry);

  showState("idle");
})();

/* ===========================================================
   AMBIENT PARTICLE FIELD
   Fully self-contained: it does not read from or write to any
   of the prediction/state code above, and the prediction flow
   does not depend on it. Purely decorative background atmosphere.
=========================================================== */
(() => {
  "use strict";

  const canvas = document.getElementById("particle-field");
  if (!canvas || typeof canvas.getContext !== "function") return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return; // canvas not supported in this environment — skip decoration entirely
  const reduceMotionQuery = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : { matches: false, addEventListener: () => {} };

  // Muted palette lifted from the design tokens — kept in sync manually
  // since canvas drawing can't read CSS custom properties directly.
  const PARTICLE_COLORS = [
    "159, 184, 168", // sage
    "196, 216, 204", // mint
    "114, 170, 160", // teal
  ];

  let width = 0;
  let height = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let particles = [];
  let rafId = null;

  function particleCountForWidth(w) {
    if (w <= 640) return 18; // mobile: within the 12–25 range
    return 36; // desktop: within the 25–45 range
  }

  function createParticle() {
    // Depth cue: larger + brighter particles drift slower, small dim
    // ones drift a little faster — gives the field a sense of layers
    // rather than a flat wallpaper of identical dots.
    const depth = Math.random();
    const size = 1 + depth * 1.2; // ~1–2.2px
    const speed = (1 - depth) * 0.10 + 0.02; // slower when larger

    const angle = Math.random() * Math.PI * 2;
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      size,
      baseOpacity: 0.12 + depth * 0.28,
      opacity: 0,
      phase: Math.random() * Math.PI * 2,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
    };
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = particleCountForWidth(width);
    particles = Array.from({ length: count }, createParticle);
  }

  function step(time) {
    ctx.clearRect(0, 0, width, height);

    // Gentle breathing opacity so particles fade in and out rather than
    // popping in at a fixed brightness.
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around edges for continuous, seamless drifting.
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;
      if (p.y < -10) p.y = height + 10;
      if (p.y > height + 10) p.y = -10;

      const breathe = Math.sin(time * 0.00035 + p.phase) * 0.25 + 0.75;
      p.opacity = p.baseOpacity * breathe;
    }

    // Very subtle connecting lines between nearby particles only.
    const maxDist = width <= 640 ? 70 : 90;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          const lineOpacity = (1 - dist / maxDist) * 0.06;
          ctx.strokeStyle = `rgba(114, 170, 160, ${lineOpacity})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    for (const p of particles) {
      ctx.beginPath();
      ctx.fillStyle = `rgba(${p.color}, ${p.opacity})`;
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    rafId = requestAnimationFrame(step);
  }

  function drawStaticFrame() {
    ctx.clearRect(0, 0, width, height);
    for (const p of particles) {
      p.opacity = p.baseOpacity;
      ctx.beginPath();
      ctx.fillStyle = `rgba(${p.color}, ${p.opacity})`;
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function start() {
    if (rafId) cancelAnimationFrame(rafId);
    if (reduceMotionQuery.matches) {
      drawStaticFrame();
      return;
    }
    rafId = requestAnimationFrame(step);
  }

  function handleResize() {
    resize();
    start();
  }

  resize();
  start();

  window.addEventListener("resize", handleResize, { passive: true });

  if (typeof reduceMotionQuery.addEventListener === "function") {
    reduceMotionQuery.addEventListener("change", start);
  }

  // Pause the animation loop when the tab is hidden to avoid burning
  // cycles in the background — pure performance hygiene.
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    } else {
      start();
    }
  });
})();