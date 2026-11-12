/* =========================================================
   四年级数学奇妙冒险岛 - 主应用控制器（自学讲堂 · 实验室 · 闯关 · 错题本 · 勋章）
   ========================================================= */
(function () {
  const STORAGE_KEY = "agy_grade4_math_adventure_v1";

  const ALL_UNITS = [
    ...(window.CURRICULUM_PART_1 || []),
    ...(window.CURRICULUM_PART_2 || [])
  ];

  const RANKS = [
    { min: 0,   title: "🌱 好奇小萌新" },
    { min: 40,  title: "🧭 数感探险家" },
    { min: 100, title: "📐 几何小达人" },
    { min: 180, title: "🪄 运算大法师" },
    { min: 260, title: "🚀 星际领航员" },
    { min: 350, title: "👑 四上数学大宗师" }
  ];

  const BADGE_DEFS = [
    { id: "b-u1",     unitId: "u1",       icon: "🌌", name: "亿万星辰官",   desc: "完成第一单元《认识更大的数》闯关" },
    { id: "b-code",   unitId: "u2-code",  icon: "🕵️", name: "数字密码特工", desc: "完成综合实践《编码的奥秘》闯关" },
    { id: "b-u2",     unitId: "u2",       icon: "📐", name: "量角神射手",   desc: "完成第二单元《线与角》闯关" },
    { id: "b-u3",     unitId: "u3",       icon: "🛰️", name: "东方红计算师", desc: "完成第三单元《整数乘法（二）》闯关" },
    { id: "b-u4",     unitId: "u4",       icon: "🔭", name: "火眼观察家",   desc: "完成第四单元《我们生活的空间》闯关" },
    { id: "b-u5",     unitId: "u5",       icon: "🪄", name: "简算大魔导",   desc: "完成第五单元《运算律》闯关" },
    { id: "b-fun",    unitId: "u-fun",    icon: "🐹", name: "有序思考王",   desc: "完成数学好玩《数图形的学问》闯关" },
    { id: "b-u6",     unitId: "u6",       icon: "🧊", name: "立体大建筑师", desc: "完成第六单元《图形的奥秘》闯关" },
    { id: "b-u7",     unitId: "u7",       icon: "🚄", name: "九章解题高手", desc: "完成第七单元《运用数量关系解决问题》闯关" },
    { id: "b-u8",     unitId: "u8",       icon: "📊", name: "首席数据分析师", desc: "完成第八单元《数据的表示和分析》闯关" },
    { id: "b-nav",    unitId: "u-nav",    icon: "🧭", name: "北斗小领航员", desc: "完成综合实践《导航给的时间准吗》闯关" },
    { id: "b-review", unitId: "u-review", icon: "👑", name: "四上满贯状元", desc: "通关《总复习》终极挑战" }
  ];

  const defaultState = {
    stars: 0,
    doneLessons: {},   // lessonId: true
    unitBestStars: {}, // unitId: 0..3
    wrongBook: {},     // qId: { unitId, addedAt }
    lastUnitId: "u1",
    fontSize: "large", // 默认大字号，贴心适配手机和 iPad 屏幕
    eyeCare: false,
    sound: true
  };

  let state = loadState();

  // 当前路由视图状态
  let currentTab = "map";       // map | unit | labs | wrong | badges
  let currentFilter = "all";    // all | num | geo | stat
  let activeUnitId = state.lastUnitId || "u1";
  let activeUnitMode = "learn"; // learn | lab | quiz
  let selectedHubLab = "lab-big-numbers";

  // 测验会话状态
  let quizSession = null;

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return Object.assign({}, defaultState, JSON.parse(raw));
      }
    } catch (e) {}
    return Object.assign({}, defaultState);
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  function getRankTitle(stars) {
    let cur = RANKS[0].title;
    for (const r of RANKS) {
      if (stars >= r.min) cur = r.title;
    }
    return cur;
  }

  function applyPreferences() {
    document.documentElement.setAttribute("data-font", state.fontSize || "large");
    document.body.classList.toggle("eye-care", !!state.eyeCare);
    SoundFX.setEnabled(state.sound !== false);
  }

  function findQuestionById(qId) {
    for (const u of ALL_UNITS) {
      for (const q of u.quiz) {
        if (q.id === qId) return { unit: u, question: q };
      }
    }
    return null;
  }

  function updateHeaderAndNav() {
    const starEl = document.getElementById("hdr-stars");
    if (starEl) starEl.textContent = state.stars;

    const fontLabels = { normal: "字号:标准", large: "字号:大", xlarge: "字号:特大" };
    const fontBtn = document.getElementById("btn-font");
    if (fontBtn) fontBtn.textContent = "🔠 " + (fontLabels[state.fontSize] || "字号:大");

    const eyeBtn = document.getElementById("btn-eye");
    if (eyeBtn) {
      eyeBtn.classList.toggle("active", !!state.eyeCare);
      eyeBtn.textContent = state.eyeCare ? "🌿 护眼开" : "🌿 护眼";
    }

    const sndBtn = document.getElementById("btn-sound");
    if (sndBtn) {
      sndBtn.classList.toggle("active", state.sound !== false);
      sndBtn.textContent = state.sound !== false ? "🔊 音效" : "🔇 静音";
    }

    const wrongCount = Object.keys(state.wrongBook || {}).length;
    const badgeEl = document.getElementById("wrong-count-badge");
    if (badgeEl) {
      badgeEl.style.display = wrongCount > 0 ? "inline-flex" : "none";
      badgeEl.textContent = wrongCount;
    }

    document.querySelectorAll(".nav-item").forEach((btn) => {
      const target = btn.dataset.nav;
      const isAct = (target === currentTab) || (currentTab === "unit" && target === "map");
      btn.classList.toggle("active", isAct);
    });
  }

  // ==================== 渲染视图 1：探险地图首页 ====================
  function renderMap(main) {
    const totalLessons = ALL_UNITS.reduce((s, u) => s + u.lessons.length, 0);
    const doneCount = Object.keys(state.doneLessons).length;
    const clearedUnits = Object.values(state.unitBestStars).filter(v => v >= 2).length;
    const pct = Math.min(100, Math.round(((doneCount + clearedUnits * 2) / (totalLessons + ALL_UNITS.length * 2)) * 100));

    const lastUnit = ALL_UNITS.find(u => u.id === state.lastUnitId) || ALL_UNITS[0];

    const filteredUnits = ALL_UNITS.filter(u => {
      if (currentFilter === "all") return true;
      return u.category === currentFilter || u.category === "all";
    });

    const cardsHtml = filteredUnits.map((u) => {
      const uDone = u.lessons.filter(l => state.doneLessons[l.id]).length;
      const uStars = state.unitBestStars[u.id] || 0;
      const starStr = "⭐".repeat(uStars) + "☆".repeat(3 - uStars);
      return `
        <article class="unit-card" data-open-unit="${u.id}" style="--unit-color:${u.color};--unit-bg:${u.bg};">
          <div>
            <div class="unit-card-top">
              <div class="unit-emoji-box">${u.emoji}</div>
              <div class="unit-stars" title="闯关最高星级">${starStr}</div>
            </div>
            <div style="margin-top:12px;">
              <span class="unit-tag">${u.code}</span>
              <h2 class="unit-title">${u.title}</h2>
              <p class="unit-summary">${u.summary}</p>
            </div>
          </div>
          <div class="unit-footer">
            <span>📖 已学 ${uDone}/${u.lessons.length} 课 · ⚔️ ${u.quiz.length} 题</span>
            <span class="unit-mini-btn">出发 ➔</span>
          </div>
        </article>
      `;
    }).join("");

    main.innerHTML = `
      <section class="hero-banner">
        <div class="hero-grid">
          <div>
            <div class="hero-badge">${getRankTitle(state.stars)} · 北师大版四年级上册（新教材同步）</div>
            <h1 class="hero-title">欢迎来到奇妙数学冒险岛！🏝️</h1>
            <p class="hero-desc">跟着淘气、笑笑和智慧老人一起“讲道理”学数学：看趣味漫画讲义、玩触控实验玩具、闯关集星拿勋章！</p>
            <button class="btn-3d btn-soft" id="hero-continue" style="color:#D95B14;border-color:#FFF;">
              🚀 继续探险：${lastUnit.code}《${lastUnit.title}》
            </button>
          </div>
          <div class="hero-stats-box">
            <div style="display:flex;justify-content:space-between;font-weight:800;font-size:0.95rem;">
              <span>🗺️ 全册总进度</span>
              <span class="num">${pct}%</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" style="width:${pct}%;"></div>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:0.86rem;margin-top:8px;opacity:0.95;">
              <span>📚 讲堂：${doneCount}/${totalLessons} 课</span>
              <span>🏆 通关：${clearedUnits}/${ALL_UNITS.length} 章</span>
            </div>
          </div>
        </div>
      </section>

      <div class="filter-bar">
        <button class="filter-chip ${currentFilter==="all"?"active":""}" data-filter="all">🌟 全部章节 (${ALL_UNITS.length})</button>
        <button class="filter-chip ${currentFilter==="num"?"active":""}" data-filter="num">🔢 数与代数</button>
        <button class="filter-chip ${currentFilter==="geo"?"active":""}" data-filter="geo">📐 图形与几何</button>
        <button class="filter-chip ${currentFilter==="stat"?"active":""}" data-filter="stat">📊 统计与综合实践</button>
      </div>

      <section class="units-grid">
        ${cardsHtml}
      </section>
    `;

    main.querySelector("#hero-continue").addEventListener("click", () => {
      SoundFX.pop();
      openUnit(lastUnit.id, "learn");
    });

    main.querySelectorAll("[data-filter]").forEach(b => {
      b.addEventListener("click", () => {
        SoundFX.click();
        currentFilter = b.dataset.filter;
        render();
      });
    });

    main.querySelectorAll("[data-open-unit]").forEach(card => {
      card.addEventListener("click", () => {
        SoundFX.pop();
        openUnit(card.dataset.openUnit, "learn");
      });
    });
  }

  function openUnit(unitId, mode) {
    activeUnitId = unitId;
    activeUnitMode = mode || "learn";
    state.lastUnitId = unitId;
    saveState();
    currentTab = "unit";
    if (activeUnitMode === "quiz") {
      startQuizForUnit(unitId);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
    render();
  }

  // ==================== 渲染视图 2：单章自学舱 ====================
  function renderUnitView(main) {
    const unit = ALL_UNITS.find(u => u.id === activeUnitId) || ALL_UNITS[0];
    const uStars = state.unitBestStars[unit.id] || 0;
    const unitIdx = ALL_UNITS.findIndex(u => u.id === unit.id);
    const nextUnit = ALL_UNITS[unitIdx + 1] || null;

    let subBodyHtml = "";

    if (activeUnitMode === "learn") {
      subBodyHtml = `
        <div class="lesson-list">
          ${unit.lessons.map((les) => {
            const isDone = !!state.doneLessons[les.id];
            return `
              <article class="lesson-card ${isDone ? "done" : ""}">
                <div class="lesson-head">
                  <div>
                    <span class="lesson-num-badge">${les.tag}</span>
                    <h2 class="lesson-title">${les.title}</h2>
                  </div>
                  ${isDone ? `<span class="stat-pill" style="background:#DCFCE7;color:#166534;border-color:#86EFAC;">✅ 已掌握</span>` : ""}
                </div>

                <div class="story-bubble">${les.story}</div>

                <div class="key-points-box">
                  <strong style="color:var(--primary-dark);font-size:1.05rem;">🔍 核心数学道理：</strong>
                  <ul>
                    ${les.points.map(p => `<li>${p}</li>`).join("")}
                  </ul>
                </div>

                <div class="formula-banner num">${les.formula}</div>

                <div class="example-box">${les.example}</div>

                <div class="mnemonic-box"><strong>${les.mnemonic}</strong></div>

                <div class="lesson-actions">
                  <button class="btn-3d ${isDone ? "btn-soft" : "btn-green"}" data-mark-lesson="${les.id}">
                    ${isDone ? "👏 已收入囊中" : "✅ 我看懂学会啦！（+10 ⭐）"}
                  </button>
                </div>
              </article>
            `;
          }).join("")}

          <div style="text-align:center;padding:12px 0;display:flex;justify-content:center;gap:14px;flex-wrap:wrap;">
            <button class="btn-3d btn-blue" id="go-to-lab">🧪 去玩《${unit.labTitle}》</button>
            <button class="btn-3d btn-primary" id="go-to-quiz">⚔️ 进入本章闯关练兵场！</button>
          </div>
        </div>
      `;
    } else if (activeUnitMode === "lab") {
      subBodyHtml = `
        <div class="lab-wrapper">
          <h2 style="margin:0 0 12px;font-size:var(--h2-size);">🧪 ${unit.labTitle}</h2>
          <div id="unit-lab-mount"></div>
          <div style="margin-top:20px;text-align:right;">
            <button class="btn-3d btn-primary" id="lab-to-quiz">⚔️ 玩明白啦，去闯关拿星星 ➔</button>
          </div>
        </div>
      `;
    } else {
      subBodyHtml = renderQuizMarkup(unit, nextUnit);
    }

    main.innerHTML = `
      <div class="unit-header-card" style="border-color:${unit.color}44;">
        <div class="back-row">
          <button class="tool-btn" id="btn-back-map">⬅️ 返回探险地图</button>
          <span class="stat-pill">本章星级：${"⭐".repeat(uStars)}${"☆".repeat(3 - uStars)}</span>
        </div>
        <div style="display:flex;align-items:center;gap:14px;">
          <div class="unit-emoji-box" style="--unit-bg:${unit.bg};">${unit.emoji}</div>
          <div>
            <span class="unit-tag" style="--unit-bg:${unit.bg};--unit-color:${unit.color};">${unit.code}</span>
            <h1 style="margin:2px 0 0;font-size:var(--h2-size);">${unit.title}</h1>
          </div>
        </div>
      </div>

      <div class="mode-tabs">
        <button class="mode-tab ${activeUnitMode==="learn"?"active":""}" data-umode="learn">📚 知识讲堂 (${unit.lessons.length})</button>
        <button class="mode-tab ${activeUnitMode==="lab"?"active":""}" data-umode="lab">🧪 动手实验室</button>
        <button class="mode-tab ${activeUnitMode==="quiz"?"active":""}" data-umode="quiz">⚔️ 闯关练兵 (${unit.quiz.length})</button>
      </div>

      ${subBodyHtml}
    `;

    main.querySelector("#btn-back-map").addEventListener("click", () => {
      SoundFX.click();
      currentTab = "map";
      render();
    });

    main.querySelectorAll("[data-umode]").forEach(btn => {
      btn.addEventListener("click", () => {
        SoundFX.click();
        const m = btn.dataset.umode;
        activeUnitMode = m;
        if (m === "quiz" && (!quizSession || quizSession.unitId !== unit.id)) {
          startQuizForUnit(unit.id);
        }
        render();
      });
    });

    if (activeUnitMode === "learn") {
      main.querySelectorAll("[data-mark-lesson]").forEach(btn => {
        btn.addEventListener("click", () => {
          const lid = btn.dataset.markLesson;
          if (!state.doneLessons[lid]) {
            state.doneLessons[lid] = true;
            state.stars += 10;
            saveState();
            SoundFX.correct();
            render();
          } else {
            SoundFX.click();
          }
        });
      });
      main.querySelector("#go-to-lab").addEventListener("click", () => {
        SoundFX.pop();
        activeUnitMode = "lab";
        window.scrollTo({ top: 0, behavior: "smooth" });
        render();
      });
      main.querySelector("#go-to-quiz").addEventListener("click", () => {
        SoundFX.pop();
        activeUnitMode = "quiz";
        startQuizForUnit(unit.id);
        window.scrollTo({ top: 0, behavior: "smooth" });
        render();
      });
    } else if (activeUnitMode === "lab") {
      MathLabs.mount(unit.labId, main.querySelector("#unit-lab-mount"));
      main.querySelector("#lab-to-quiz").addEventListener("click", () => {
        SoundFX.pop();
        activeUnitMode = "quiz";
        startQuizForUnit(unit.id);
        window.scrollTo({ top: 0, behavior: "smooth" });
        render();
      });
    } else {
      bindQuizEvents(main, unit, nextUnit);
    }
  }

  // ==================== 测验与触屏填空逻辑 ====================
  function startQuizForUnit(unitId, customQuestions, isWrongReview) {
    const unit = ALL_UNITS.find(u => u.id === unitId) || ALL_UNITS[0];
    const qs = customQuestions || unit.quiz;
    quizSession = {
      unitId: unit.id,
      isWrongReview: !!isWrongReview,
      questions: qs,
      idx: 0,
      results: new Array(qs.length).fill(null), // null | true | false
      answered: false,
      userAnswer: "",
      correctCount: 0,
      finished: false,
      earnedStarsAwarded: false
    };
  }

  function renderQuizMarkup(unit, nextUnit) {
    if (!quizSession || quizSession.unitId !== unit.id) {
      startQuizForUnit(unit.id);
    }
    const s = quizSession;

    if (s.finished) {
      const ratio = s.correctCount / s.questions.length;
      const starsEarned = ratio === 1 ? 3 : ratio >= 0.65 ? 2 : ratio >= 0.34 ? 1 : 0;
      const praise =
        starsEarned === 3 ? "🏆 满分全对！太厉害啦，智慧老人为你竖起大拇指！" :
        starsEarned === 2 ? "🎉 闯关成功！已经掌握绝大部分知识点啦！" :
        starsEarned === 1 ? "💪 继续加油！看看错题解析再挑战一次吧！" :
                            "🌱 别灰心！先回知识讲堂看看口诀，你一定行！";

      return `
        <div class="quiz-card" style="text-align:center;">
          <div style="font-size:3.2rem;margin-bottom:8px;">${starsEarned >= 2 ? "🎊" : "📚"}</div>
          <div style="font-size:2rem;letter-spacing:6px;margin-bottom:8px;">
            ${"⭐".repeat(starsEarned)}${"☆".repeat(3 - starsEarned)}
          </div>
          <h2 style="margin:6px 0 10px;">答对 <span class="num" style="color:var(--primary);">${s.correctCount} / ${s.questions.length}</span> 题</h2>
          <p style="font-size:1.05rem;color:var(--text-muted);max-width:520px;margin:0 auto 22px;">${praise}</p>
          <div style="display:flex;justify-content:center;gap:12px;flex-wrap:wrap;">
            <button class="btn-3d btn-blue" id="quiz-retry">🔄 再闯一次刷满分</button>
            ${nextUnit ? `<button class="btn-3d btn-primary" id="quiz-next-unit">🚀 前往下一章：${nextUnit.title}</button>` : `<button class="btn-3d btn-primary" id="quiz-go-badges">🏆 查看我的荣誉勋章墙</button>`}
          </div>
        </div>
      `;
    }

    const q = s.questions[s.idx];
    const dotsHtml = s.questions.map((_, i) => {
      let cls = "quiz-dot";
      if (i === s.idx) cls += " current";
      else if (s.results[i] === true) cls += " correct";
      else if (s.results[i] === false) cls += " wrong";
      return `<span class="${cls}"></span>`;
    }).join("");

    let interactionHtml = "";
    if (q.type === "choice") {
      const letters = ["A", "B", "C", "D"];
      interactionHtml = `
        <div class="options-list two-col">
          ${q.options.map((opt, oi) => {
            let cls = "option-btn";
            if (s.answered) {
              if (oi === q.answer) cls += " correct";
              else if (oi === s.userAnswer && oi !== q.answer) cls += " wrong";
            }
            return `
              <button class="${cls}" data-opt="${oi}" ${s.answered ? "disabled" : ""}>
                <span class="option-letter">${letters[oi]}</span>
                <span>${opt}</span>
              </button>
            `;
          }).join("")}
        </div>
      `;
    } else {
      // 触屏友好数字填空键盘
      interactionHtml = `
        <div class="numpad-wrap">
          <div class="fill-display num">
            <span style="color:${s.userAnswer ? "var(--text-main)" : "#94A3B8"};">${s.userAnswer || "请点击下方数字键输入答案"}</span>
            ${s.answered ? `<span>${String(s.userAnswer) === String(q.answer) ? "✅" : "❌ 正确答案：" + q.answer}</span>` : ""}
          </div>
          ${!s.answered ? `
            <div class="numpad-grid">
              ${["1","2","3","⌫","4","5","6","清空","7","8","9","0"].map(k =>
                `<button class="pad-key" data-pad="${k}">${k}</button>`
              ).join("")}
            </div>
            <button class="btn-3d btn-primary" id="fill-submit" style="width:100%;margin-top:12px;">✨ 提交答案</button>
          ` : ""}
        </div>
      `;
    }

    let feedbackHtml = "";
    if (s.answered) {
      const isOk = s.results[s.idx] === true;
      feedbackHtml = `
        <div class="feedback-banner ${isOk ? "ok" : "err"}">
          <div style="font-weight:900;font-size:1.1rem;margin-bottom:6px;">
            ${isOk ? "🎉 答对啦！（+15 ⭐）" : "💡 差一点点！已自动加入《错题宝典》，来看看道理吧："}
          </div>
          <div>${q.explain}</div>
          <div style="margin-top:14px;text-align:right;">
            <button class="btn-3d ${isOk ? "btn-green" : "btn-primary"}" id="quiz-next-q">
              ${s.idx + 1 < s.questions.length ? "下一题 ➔" : "🏁 查看闯关成绩单"}
            </button>
          </div>
        </div>
      `;
    }

    return `
      <div class="quiz-card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <span class="lesson-num-badge">第 ${s.idx + 1} / ${s.questions.length} 题 · ${q.type === "fill" ? "数字填空" : "趣味单选"}</span>
          <span style="font-size:0.88rem;color:var(--text-muted);font-weight:700;">答对题数：${s.correctCount}</span>
        </div>
        <div class="quiz-dots">${dotsHtml}</div>
        <div class="quiz-question-text">${q.q}</div>
        ${interactionHtml}
        ${feedbackHtml}
      </div>
    `;
  }

  function submitCurrentAnswer(val) {
    const s = quizSession;
    if (!s || s.answered) return;
    const q = s.questions[s.idx];
    s.userAnswer = val;
    s.answered = true;

    const isCorrect = q.type === "choice"
      ? Number(val) === Number(q.answer)
      : String(val).trim() === String(q.answer).trim();

    s.results[s.idx] = isCorrect;
    if (isCorrect) {
      s.correctCount++;
      state.stars += 15;
      if (s.isWrongReview && state.wrongBook[q.id]) {
        delete state.wrongBook[q.id];
      }
      SoundFX.correct();
    } else {
      state.wrongBook[q.id] = { unitId: q._unitId || s.unitId, addedAt: Date.now() };
      SoundFX.wrong();
    }
    saveState();
    render();
  }

  function bindQuizEvents(container, unit, nextUnit) {
    const s = quizSession;
    if (!s) return;

    if (s.finished) {
      const retryBtn = container.querySelector("#quiz-retry");
      if (retryBtn) {
        retryBtn.addEventListener("click", () => {
          SoundFX.pop();
          startQuizForUnit(unit.id);
          render();
        });
      }
      const nextUnitBtn = container.querySelector("#quiz-next-unit");
      if (nextUnitBtn && nextUnit) {
        nextUnitBtn.addEventListener("click", () => {
          SoundFX.pop();
          openUnit(nextUnit.id, "learn");
        });
      }
      const badgeBtn = container.querySelector("#quiz-go-badges");
      if (badgeBtn) {
        badgeBtn.addEventListener("click", () => {
          SoundFX.pop();
          currentTab = "badges";
          render();
        });
      }
      return;
    }

    container.querySelectorAll("[data-opt]").forEach(btn => {
      btn.addEventListener("click", () => {
        submitCurrentAnswer(Number(btn.dataset.opt));
      });
    });

    container.querySelectorAll("[data-pad]").forEach(btn => {
      btn.addEventListener("click", () => {
        SoundFX.click();
        const k = btn.dataset.pad;
        if (k === "⌫") {
          s.userAnswer = String(s.userAnswer).slice(0, -1);
        } else if (k === "清空") {
          s.userAnswer = "";
        } else if (String(s.userAnswer).length < 10) {
          s.userAnswer = String(s.userAnswer) + k;
        }
        render();
      });
    });

    const fillSub = container.querySelector("#fill-submit");
    if (fillSub) {
      fillSub.addEventListener("click", () => {
        if (!String(s.userAnswer).trim()) {
          SoundFX.wrong();
          return;
        }
        submitCurrentAnswer(s.userAnswer);
      });
    }

    const nextQ = container.querySelector("#quiz-next-q");
    if (nextQ) {
      nextQ.addEventListener("click", () => {
        SoundFX.click();
        if (s.idx + 1 < s.questions.length) {
          s.idx++;
          s.answered = false;
          s.userAnswer = "";
        } else {
          s.finished = true;
          if (!s.isWrongReview) {
            const ratio = s.correctCount / s.questions.length;
            const starsEarned = ratio === 1 ? 3 : ratio >= 0.65 ? 2 : ratio >= 0.34 ? 1 : 0;
            const prevBest = state.unitBestStars[unit.id] || 0;
            if (starsEarned > prevBest) {
              state.unitBestStars[unit.id] = starsEarned;
              saveState();
            }
            if (starsEarned >= 2) {
              SoundFX.fanfare();
              ConfettiFX.burst();
            }
          } else if (s.correctCount > 0) {
            SoundFX.fanfare();
            ConfettiFX.burst();
          }
        }
        render();
      });
    }
  }

  // ==================== 渲染视图 3：奇妙实验室总大厅 ====================
  function renderLabsHub(main) {
    const activeU = ALL_UNITS.find(u => u.labId === selectedHubLab) || ALL_UNITS[0];

    main.innerHTML = `
      <div class="unit-header-card">
        <h1 style="margin:0 0 6px;font-size:var(--h2-size);">🔬 奇妙数学实验室大厅（共12座互动玩具舱）</h1>
        <p style="margin:0;color:var(--text-muted);">点选任意实验工具，用手指拨一拨、转一转、搭一搭，亲眼看见数学背后的道理！</p>
        <div class="filter-bar" style="margin-top:14px;margin-bottom:0;">
          ${ALL_UNITS.map(u => `
            <button class="filter-chip ${u.labId===selectedHubLab?"active":""}" data-hub-lab="${u.labId}">
              ${u.emoji} ${u.title}
            </button>
          `).join("")}
        </div>
      </div>

      <div class="lab-wrapper">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:12px;">
          <h2 style="margin:0;font-size:var(--h2-size);">${activeU.emoji} ${activeU.labTitle}</h2>
          <button class="tool-btn" id="hub-jump-unit">📖 查看对应课文讲义 ➔</button>
        </div>
        <div id="hub-lab-mount"></div>
      </div>
    `;

    main.querySelectorAll("[data-hub-lab]").forEach(b => {
      b.addEventListener("click", () => {
        SoundFX.click();
        selectedHubLab = b.dataset.hubLab;
        render();
      });
    });

    main.querySelector("#hub-jump-unit").addEventListener("click", () => {
      SoundFX.pop();
      openUnit(activeU.id, "learn");
    });

    MathLabs.mount(activeU.labId, main.querySelector("#hub-lab-mount"));
  }

  // ==================== 渲染视图 4：错题宝典 ====================
  function renderWrongBook(main) {
    const wrongIds = Object.keys(state.wrongBook || {});

    if (quizSession && quizSession.isWrongReview && !quizSession.finished) {
      main.innerHTML = `
        <div class="unit-header-card">
          <div class="back-row">
            <button class="tool-btn" id="exit-wrong-quiz">⬅️ 返回错题列表</button>
            <span class="stat-pill">🎯 答对即可把错题彻底消灭！</span>
          </div>
          <h1 style="margin:0;font-size:var(--h2-size);">⚔️ 消灭错题特训营</h1>
        </div>
        ${renderQuizMarkup(ALL_UNITS[0], null)}
      `;
      main.querySelector("#exit-wrong-quiz").addEventListener("click", () => {
        quizSession = null;
        render();
      });
      bindQuizEvents(main, ALL_UNITS[0], null);
      return;
    }

    if (wrongIds.length === 0) {
      main.innerHTML = `
        <div class="quiz-card" style="text-align:center;padding:44px 20px;">
          <div style="font-size:3.5rem;margin-bottom:10px;">🌟</div>
          <h1 style="margin:0 0 8px;font-size:var(--h2-size);">太棒啦！错题宝典空空如也！</h1>
          <p style="color:var(--text-muted);max-width:460px;margin:0 auto 20px;">你在闯关中答错的题目会自动收集到这里。去各单元闯关练兵场大显身手吧！</p>
          <button class="btn-3d btn-primary" id="wb-go-map">🗺️ 去探险地图闯关</button>
        </div>
      `;
      main.querySelector("#wb-go-map").addEventListener("click", () => {
        SoundFX.pop();
        currentTab = "map";
        render();
      });
      return;
    }

    const items = wrongIds.map(id => findQuestionById(id)).filter(Boolean);

    main.innerHTML = `
      <div class="unit-header-card" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
        <div>
          <h1 style="margin:0 0 4px;font-size:var(--h2-size);">📓 我的错题宝典（共 ${items.length} 道待攻克）</h1>
          <p style="margin:0;color:var(--text-muted);">温故而知新！点击“开始消灭错题”，答对后错题就会自动消除哦！</p>
        </div>
        <button class="btn-3d btn-primary" id="start-wrong-review">⚔️ 开始消灭错题 (${items.length})</button>
      </div>

      <div class="lesson-list">
        ${items.map(({ unit, question }) => `
          <div class="lesson-card">
            <span class="unit-tag" style="--unit-bg:${unit.bg};--unit-color:${unit.color};">${unit.code} · ${unit.title}</span>
            <div style="font-size:1.12rem;font-weight:800;margin:8px 0 12px;">${question.q}</div>
            <div class="example-box">
              <strong>✅ 正确答案：</strong> ${question.type === "choice" ? question.options[question.answer] : question.answer}<br>
              <strong>💡 讲道理：</strong> ${question.explain}
            </div>
          </div>
        `).join("")}
      </div>
    `;

    main.querySelector("#start-wrong-review").addEventListener("click", () => {
      SoundFX.pop();
      const reviewQs = items.map(({ unit, question }) => Object.assign({}, question, { _unitId: unit.id }));
      startQuizForUnit("wrong-review", reviewQs, true);
      quizSession.unitId = ALL_UNITS[0].id;
      render();
    });
  }

  // ==================== 渲染视图 5：荣誉勋章墙 ====================
  function renderBadges(main) {
    const unlockedCount = BADGE_DEFS.filter(b => (state.unitBestStars[b.unitId] || 0) >= 2).length;
    const doneLessonsCount = Object.keys(state.doneLessons).length;

    main.innerHTML = `
      <div class="unit-header-card" style="text-align:center;">
        <div style="font-size:2.8rem;">🏆</div>
        <h1 style="margin:4px 0;font-size:var(--h2-size);">${getRankTitle(state.stars)}</h1>
        <p style="margin:4px 0 14px;color:var(--text-muted);">
          累计能量星：<strong class="num" style="color:#D97706;">${state.stars} ⭐</strong> ｜
          已学课文：<strong class="num">${doneLessonsCount} 篇</strong> ｜
          点亮勋章：<strong class="num">${unlockedCount} / ${BADGE_DEFS.length} 枚</strong>
        </p>
      </div>

      <div class="badges-grid">
        ${BADGE_DEFS.map(b => {
          const stars = state.unitBestStars[b.unitId] || 0;
          const unlocked = stars >= 2;
          return `
            <div class="badge-item ${unlocked ? "unlocked" : "locked"}" data-badge-unit="${b.unitId}" style="cursor:pointer;">
              <div class="badge-icon">${b.icon}</div>
              <div style="font-weight:900;font-size:1.05rem;margin-bottom:4px;">${b.name}</div>
              <div style="font-size:0.84rem;color:var(--text-muted);margin-bottom:8px;">${b.desc}</div>
              <div style="font-size:0.85rem;font-weight:800;color:${unlocked?"#D97706":"#64748B"};">
                ${unlocked ? "✨ 已点亮 (" + "⭐".repeat(stars) + ")" : "🔒 闯关获2星解锁"}
              </div>
            </div>
          `;
        }).join("")}
      </div>

      <div style="text-align:center;margin-top:28px;">
        <button class="tool-btn" id="btn-reset-data" style="color:var(--text-muted);">🧹 重置学习记录（家长/重新探险用）</button>
      </div>
    `;

    main.querySelectorAll("[data-badge-unit]").forEach(card => {
      card.addEventListener("click", () => {
        SoundFX.pop();
        openUnit(card.dataset.badgeUnit, "quiz");
      });
    });

    main.querySelector("#btn-reset-data").addEventListener("click", () => {
      if (window.confirm("确定要清空所有星星、勋章和错题记录，重新开始冒险吗？")) {
        state = Object.assign({}, defaultState, { fontSize: state.fontSize, eyeCare: state.eyeCare, sound: state.sound });
        saveState();
        render();
      }
    });
  }

  // ==================== 全局渲染与顶栏/底栏绑定 ====================
  function render() {
    applyPreferences();
    updateHeaderAndNav();
    const main = document.getElementById("app-main");
    if (!main) return;

    if (currentTab === "map") renderMap(main);
    else if (currentTab === "unit") renderUnitView(main);
    else if (currentTab === "labs") renderLabsHub(main);
    else if (currentTab === "wrong") renderWrongBook(main);
    else if (currentTab === "badges") renderBadges(main);
  }

  function initGlobalEvents() {
    document.getElementById("brand-home").addEventListener("click", () => {
      SoundFX.click();
      currentTab = "map";
      render();
    });

    document.getElementById("btn-font").addEventListener("click", () => {
      SoundFX.click();
      const order = ["normal", "large", "xlarge"];
      const idx = order.indexOf(state.fontSize);
      state.fontSize = order[(idx + 1) % order.length];
      saveState();
      render();
    });

    document.getElementById("btn-eye").addEventListener("click", () => {
      SoundFX.click();
      state.eyeCare = !state.eyeCare;
      saveState();
      render();
    });

    document.getElementById("btn-sound").addEventListener("click", () => {
      state.sound = state.sound === false ? true : false;
      SoundFX.setEnabled(state.sound);
      if (state.sound) SoundFX.pop();
      saveState();
      updateHeaderAndNav();
    });

    document.querySelectorAll(".nav-item").forEach(btn => {
      btn.addEventListener("click", () => {
        SoundFX.click();
        quizSession = null;
        currentTab = btn.dataset.nav;
        window.scrollTo({ top: 0, behavior: "smooth" });
        render();
      });
    });

    // 支持 iPad 外接键盘或电脑直接敲数字键做填空题
    window.addEventListener("keydown", (e) => {
      if (currentTab === "unit" && activeUnitMode === "quiz" && quizSession && !quizSession.finished && !quizSession.answered) {
        const q = quizSession.questions[quizSession.idx];
        if (q && q.type === "fill") {
          if (/^[0-9]$/.test(e.key) && String(quizSession.userAnswer).length < 10) {
            quizSession.userAnswer = String(quizSession.userAnswer) + e.key;
            render();
          } else if (e.key === "Backspace") {
            quizSession.userAnswer = String(quizSession.userAnswer).slice(0, -1);
            render();
          } else if (e.key === "Enter" && String(quizSession.userAnswer).trim()) {
            submitCurrentAnswer(quizSession.userAnswer);
          }
        }
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initGlobalEvents();
    render();
  });
})();
