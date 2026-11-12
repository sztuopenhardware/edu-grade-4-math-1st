/* =========================================================
   四年级数学奇妙冒险岛 - 12大互动数学实验室引擎（触屏/iPad/手机全适配）
   ========================================================= */
window.MathLabs = (function () {
  // 工具：把任意 0 ~ 999999999999 整数转为标准中文读法（严格遵循北师大版四位分级规则）
  function numberToChinese(numStr) {
    const clean = String(numStr).replace(/\D/g, "").replace(/^0+/, "") || "0";
    if (clean === "0") return "零";
    const digits = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
    const units = ["", "十", "百", "千"];

    function readFourDigits(fourStr, isHighestGroup) {
      let res = "";
      let zeroFlag = false;
      const padded = fourStr.padStart(4, "0");
      for (let i = 0; i < 4; i++) {
        const d = Number(padded[i]);
        const pos = 3 - i;
        if (d === 0) {
          if (!isHighestGroup || res.length > 0) {
            zeroFlag = true;
          }
        } else {
          if (zeroFlag) {
            res += "零";
            zeroFlag = false;
          }
          // 习惯读法：最高级若以“一十”开头（如 15 或 150000），常读作“十五”或“一十五”，北师大版教材大数中如 1443497378 读作“十四亿…”
          if (isHighestGroup && res.length === 0 && d === 1 && pos === 1) {
            res += "十";
          } else {
            res += digits[d] + units[pos];
          }
        }
      }
      return res;
    }

    const padded12 = clean.padStart(12, "0");
    const yiPart = padded12.slice(0, 4);
    const wanPart = padded12.slice(4, 8);
    const gePart = padded12.slice(8, 12);

    const yiVal = Number(yiPart);
    const wanVal = Number(wanPart);
    const geVal = Number(gePart);

    let result = "";
    if (yiVal > 0) {
      result += readFourDigits(String(yiVal), true) + "亿";
    }
    if (wanVal > 0) {
      if (yiVal > 0 && wanVal < 1000) {
        // 千位为0，已经在 readFourDigits 里处理前导零
      }
      result += readFourDigits(wanPart, yiVal === 0) + "万";
    }
    if (geVal > 0) {
      const needLeadingZero = (yiVal > 0 && wanVal === 0 && geVal >= 1000);
      if (needLeadingZero) result += "零";
      result += readFourDigits(gePart, yiVal === 0 && wanVal === 0);
    }
    return result;
  }

  // ==================== 实验室 1：大数计数器与分级读数机 ====================
  function renderBigNumbers(container) {
    let currentNum = "1443497378";
    const placeNames = ["千亿", "百亿", "十亿", "亿", "千万", "百万", "十万", "万", "千", "百", "十", "个"];

    function updateView() {
      const clean = String(currentNum).replace(/\D/g, "").slice(0, 12).replace(/^0+/, "") || "0";
      const padded = clean.padStart(12, "0");
      const yi = padded.slice(0, 4);
      const wan = padded.slice(4, 8);
      const ge = padded.slice(8, 12);
      const numVal = Number(clean);
      const approxWan = numVal >= 10000 ? Math.round(numVal / 10000) + " 万" : "不足1万（约 " + Math.round(numVal / 10000) + " 万）";
      const approxYi = numVal >= 50000000 ? Math.round(numVal / 100000000) + " 亿" : "不足半亿（四舍五入到亿位为 0 亿）";

      let colsHtml = "";
      for (let i = 0; i < 12; i++) {
        const d = Number(padded[i]);
        const groupClass = i < 4 ? "yi-group" : i < 8 ? "wan-group" : "ge-group";
        let beads = "";
        for (let b = 0; b < d; b++) beads += `<span class="bead"></span>`;
        colsHtml += `
          <div class="place-col ${groupClass}" data-idx="${i}" title="点击拨珠 +1">
            <div style="font-size:0.74rem;font-weight:800;color:var(--text-muted);">${placeNames[i]}</div>
            <div class="bead-rod">${beads}</div>
            <div class="num" style="font-size:1.15rem;font-weight:900;">${d}</div>
          </div>
        `;
      }

      container.innerHTML = `
        <div class="story-bubble">
          👆 <strong>动手试一试</strong>：点击下方任意数位柱子拨动珠子（满十自动进一！），或者点击课本经典大数，观察<strong>四位分级</strong>与<strong>零的读法</strong>！
        </div>
        <div class="lab-controls-row">
          <input id="bn-input" class="big-input num" type="text" inputmode="numeric" maxlength="12" value="${clean}" placeholder="输入12位以内整数" style="width:230px;" />
          <button class="btn-3d btn-soft" data-preset="1443497378">🇨🇳 全国人口</button>
          <button class="btn-3d btn-soft" data-preset="29600">🌉 港珠澳主桥</button>
          <button class="btn-3d btn-soft" data-preset="1200000080">🔍 练零：1200000080</button>
          <button class="btn-3d btn-soft" data-preset="0">🧹 清零</button>
        </div>

        <div class="lab-stage">
          <div style="display:flex;justify-content:space-around;font-weight:900;font-size:0.9rem;margin-bottom:6px;">
            <span style="color:#7C3AED;">【 亿 级 】</span>
            <span style="color:#EA580C;">【 万 级 】</span>
            <span style="color:#2563EB;">【 个 级 】</span>
          </div>
          <div class="place-grid">${colsHtml}</div>
        </div>

        <div class="formula-banner" style="text-align:left;line-height:1.8;">
          <div>📌 <strong>四位分级</strong>：<span class="num" style="color:#7C3AED;">${yi}</span> ｜ <span class="num" style="color:#EA580C;">${wan}</span> ｜ <span class="num" style="color:#2563EB;">${ge}</span> （共 <strong>${clean.length}</strong> 位数）</div>
          <div>🗣️ <strong>标准读作</strong>：<span style="color:var(--primary-dark);font-size:1.18rem;">${numberToChinese(clean)}</span></div>
          <div>🎯 <strong>四舍五入</strong>：到万位 ≈ <strong>${approxWan}</strong> ｜ 到亿位 ≈ <strong>${approxYi}</strong></div>
        </div>
      `;

      container.querySelector("#bn-input").addEventListener("input", (e) => {
        currentNum = e.target.value.replace(/\D/g, "").slice(0, 12) || "0";
        updateView();
        const inp = container.querySelector("#bn-input");
        inp.focus();
        inp.setSelectionRange(inp.value.length, inp.value.length);
      });

      container.querySelectorAll("[data-preset]").forEach((btn) => {
        btn.addEventListener("click", () => {
          SoundFX.pop();
          currentNum = btn.dataset.preset;
          updateView();
        });
      });

      container.querySelectorAll(".place-col").forEach((col) => {
        col.addEventListener("click", () => {
          SoundFX.click();
          const idx = Number(col.dataset.idx);
          const pow = Math.pow(10, 11 - idx);
          let next = Number(clean) + pow;
          if (next > 999999999999) next = 0;
          currentNum = String(next);
          updateView();
        });
      });
    }
    updateView();
  }

  // ==================== 实验室 2：编码破译与参赛证设计工坊 ====================
  function renderCoding(container) {
    let tab = "idcard";
    let idVal = "440513201605080324";
    let grade = "4", eventCode = "02", seq = "008", gender = "2";

    const provinceMap = {
      "11": "北京市", "12": "天津市", "13": "河北省", "21": "辽宁省", "22": "吉林省",
      "31": "上海市", "32": "江苏省", "33": "浙江省", "34": "安徽省", "37": "山东省",
      "41": "河南省", "42": "湖北省", "43": "湖南省", "44": "广东省", "50": "重庆市",
      "51": "四川省", "61": "陕西省"
    };
    const eventNames = {
      "01": "诗歌朗诵", "02": "主题演讲", "03": "书画作品",
      "04": "短视频作品", "05": "校园话剧", "06": "合唱歌唱"
    };

    function draw() {
      let bodyHtml = "";
      if (tab === "idcard") {
        const s = idVal.padEnd(18, "0").slice(0, 18).toUpperCase();
        const addr = s.slice(0, 6);
        const prov = provinceMap[s.slice(0, 2)] || "中国地区(代码" + s.slice(0, 2) + ")";
        const yr = s.slice(6, 10), mo = s.slice(10, 12), da = s.slice(12, 14);
        const order = s.slice(14, 17);
        const sexDigit = Number(s[16]);
        const sexStr = isNaN(sexDigit) ? "未知" : (sexDigit % 2 === 1 ? "👦 男性（单数）" : "👧 女性（双数）");
        const check = s[17];

        bodyHtml = `
          <div class="story-bubble">🕵️ <strong>身份证解码器</strong>：点击课本神秘号码或修改数字，观察 18 位编码每段代表什么！</div>
          <div class="lab-controls-row">
            <input id="code-id-inp" class="big-input num" maxlength="18" value="${s}" style="width:280px;letter-spacing:1.5px;" />
            <button class="btn-3d btn-soft" data-id="440513201605080324">👧 四年级笑笑示例</button>
            <button class="btn-3d btn-soft" data-id="220104196309150428">👵 课本1963奶奶</button>
            <button class="btn-3d btn-soft" data-id="22010419880312016X">👩 末位带X妈妈</button>
          </div>
          <div class="lab-stage" style="text-align:center;">
            <div class="num" style="font-size:1.35rem;font-weight:900;display:flex;flex-wrap:wrap;justify-content:center;gap:6px;margin-bottom:16px;">
              <span style="background:#DBEAFE;color:#1D4ED8;padding:8px 12px;border-radius:12px;">${addr}<br><small style="font-size:0.72rem;">地址码(6位)</small></span>
              <span style="background:#FEF3C7;color:#B45309;padding:8px 12px;border-radius:12px;">${yr}${mo}${da}<br><small style="font-size:0.72rem;">出生日期码(8位)</small></span>
              <span style="background:#FCE7F3;color:#BE185D;padding:8px 12px;border-radius:12px;">${order}<br><small style="font-size:0.72rem;">顺序码(第17位:${s[16]})</small></span>
              <span style="background:#EDE9FE;color:#6D28D9;padding:8px 12px;border-radius:12px;">${check}<br><small style="font-size:0.72rem;">校验码</small></span>
            </div>
            <div style="text-align:left;background:var(--bg-card);padding:14px 18px;border-radius:14px;border:2px solid var(--border-light);">
              📍 <strong>所属省市</strong>：${prov}（地址码 ${addr}）<br>
              🎂 <strong>出生日期</strong>：<strong>${yr} 年 ${mo} 月 ${da} 日</strong><br>
              🚻 <strong>性别破译</strong>：第 17 位是 <strong>${s[16]}</strong> 👉 <strong>${sexStr}</strong><br>
              🛡️ <strong>校验尾码</strong>：<strong>${check}</strong> ${check === "X" ? "（罗马数字 X 代表 10，保证总长度仍是18位！）" : ""}
            </div>
          </div>
        `;
      } else {
        const paddedSeq = String(seq).replace(/\D/g, "").slice(0, 3).padStart(3, "0") || "001";
        const fullCode = `${grade}${eventCode}${paddedSeq}${gender}`;
        bodyHtml = `
          <div class="story-bubble">🎨 <strong>“我爱祖国”主题活动选手编码设计台（课本第21页）</strong>：全校约300名选手，快来生成规范的参赛证吧！</div>
          <div class="lab-controls-row">
            <label><strong>年级：</strong>
              <select id="cd-grade" class="big-input">
                ${[1,2,3,4,5,6].map(g => `<option value="${g}" ${String(g)===grade?"selected":""}>${g}年级</option>`).join("")}
              </select>
            </label>
            <label><strong>项目：</strong>
              <select id="cd-event" class="big-input">
                ${Object.entries(eventNames).map(([k,v]) => `<option value="${k}" ${k===eventCode?"selected":""}>${k}-${v}</option>`).join("")}
              </select>
            </label>
            <label><strong>报名序号(1~300)：</strong>
              <input id="cd-seq" class="big-input num" type="number" min="1" max="999" value="${Number(paddedSeq)}" style="width:100px;" />
            </label>
            <label><strong>性别码：</strong>
              <select id="cd-sex" class="big-input">
                <option value="1" ${gender==="1"?"selected":""}>1-男生</option>
                <option value="2" ${gender==="2"?"selected":""}>2-女生</option>
              </select>
            </label>
          </div>
          <div class="lab-stage" style="max-width:480px;margin:14px auto;background:linear-gradient(135deg,#FFFBEB,#FEF2F2);border:3px solid #F59E0B;border-radius:22px;padding:22px;text-align:center;">
            <div style="font-weight:900;color:#B45309;font-size:1.05rem;">🏅 “我爱祖国”主题活动参赛证</div>
            <div class="num" style="font-size:2.1rem;font-weight:900;letter-spacing:4px;color:#DC2626;margin:10px 0;">${fullCode}</div>
            <div style="font-size:0.95rem;color:#374151;font-weight:700;">
              【${grade}年级】 · 【${eventNames[eventCode]}】 · 【第 ${paddedSeq} 号】 · 【${gender==="1"?"男生":"女生"}】
            </div>
            <div style="margin-top:10px;font-size:0.84rem;color:#6B7280;">✨ 瞧！序号用三位数 <code>${paddedSeq}</code> 补齐0，300名选手每个人的编码都是整齐的 7 位数！</div>
          </div>
        `;
      }

      container.innerHTML = `
        <div class="lab-subtabs">
          <button class="btn-3d ${tab==="idcard"?"btn-purple":"btn-soft"}" data-tab="idcard">🪪 18位身份证破译</button>
          <button class="btn-3d ${tab==="design"?"btn-purple":"btn-soft"}" data-tab="design">🎫 选手编码设计台</button>
        </div>
        ${bodyHtml}
      `;

      container.querySelectorAll("[data-tab]").forEach((b) => {
        b.addEventListener("click", () => { SoundFX.click(); tab = b.dataset.tab; draw(); });
      });

      if (tab === "idcard") {
        container.querySelector("#code-id-inp").addEventListener("change", (e) => {
          idVal = e.target.value.trim() || "440513201605080324";
          draw();
        });
        container.querySelectorAll("[data-id]").forEach((b) => {
          b.addEventListener("click", () => { SoundFX.pop(); idVal = b.dataset.id; draw(); });
        });
      } else {
        container.querySelector("#cd-grade").addEventListener("change", (e) => { grade = e.target.value; draw(); });
        container.querySelector("#cd-event").addEventListener("change", (e) => { eventCode = e.target.value; draw(); });
        container.querySelector("#cd-seq").addEventListener("input", (e) => { seq = e.target.value; draw(); });
        container.querySelector("#cd-sex").addEventListener("change", (e) => { gender = e.target.value; draw(); });
      }
    }
    draw();
  }

  // ==================== 实验室 3：活动角旋转与虚拟量角器 ====================
  function renderAngles(container) {
    let angle = 60;
    let showProtractor = true;
    let openRight = true; // true: 零刻度线在右边(读内圈)，false: 零刻度线在左边(读外圈)

    const triCombos = {
      15: "🧩 三角板叠法：45° － 30° ＝ 15°（或 60° － 45° ＝ 15°）",
      30: "📐 直接用 30°-60°-90° 三角板的 30° 角描出！",
      45: "📐 直接用等腰直角三角板的 45° 角描出！",
      60: "📐 直接用 30°-60°-90° 三角板的 60° 角描出！",
      75: "🧩 三角板拼法：30° ＋ 45° ＝ 75°！",
      90: "📐 直角！直接用任意三角板的 90° 直角描出！",
      105: "🧩 三角板拼法：60° ＋ 45° ＝ 105°！",
      120: "🧩 三角板拼法：90° ＋ 30° ＝ 120°！",
      135: "🧩 三角板拼法：90° ＋ 45° ＝ 135°！",
      150: "🧩 三角板拼法：90° ＋ 60° ＝ 150°！",
      180: "📏 平角！90° ＋ 90° ＝ 180°，两条边成一条直线！",
      360: "⭕ 周角！旋转一整圈回到起点，1周角＝2平角＝4直角！"
    };

    function getAngleType(deg) {
      if (deg === 0) return "零度（重合）";
      if (deg < 90) return "锐角（小于90°）";
      if (deg === 90) return "直角（等于90°）";
      if (deg < 180) return "钝角（大于90°且小于180°）";
      if (deg === 180) return "平角（等于180°）";
      if (deg < 360) return "优角（大于180°）";
      return "周角（等于360°）";
    }

    function draw() {
      const cx = 250, cy = 220, rRay = 165, rPro = 150;
      const baseDeg = openRight ? 0 : 180;
      const targetRad = openRight ? (-angle * Math.PI) / 180 : (-(180 - angle) * Math.PI) / 180;

      const x1 = cx + (openRight ? rRay : -rRay);
      const y1 = cy;
      const x2 = cx + rRay * Math.cos(targetRad);
      const y2 = cy + rRay * Math.sin(targetRad);

      // 量角器刻度绘制
      let proSvg = "";
      if (showProtractor) {
        let ticks = "";
        for (let d = 0; d <= 180; d += 10) {
          const rad = (-d * Math.PI) / 180;
          const tx1 = cx + (rPro - 12) * Math.cos(rad);
          const ty1 = cy + (rPro - 12) * Math.sin(rad);
          const tx2 = cx + rPro * Math.cos(rad);
          const ty2 = cy + rPro * Math.sin(rad);
          // 外圈从左0到右180，内圈从右0到左180
          const innerNum = d;
          const outerNum = 180 - d;
          const lxOut = cx + (rPro - 24) * Math.cos(rad);
          const lyOut = cy + (rPro - 24) * Math.sin(rad);
          const lxIn = cx + (rPro - 42) * Math.cos(rad);
          const lyIn = cy + (rPro - 42) * Math.sin(rad);
          ticks += `
            <line x1="${tx1}" y1="${ty1}" x2="${tx2}" y2="${ty2}" stroke="#475569" stroke-width="${d%30===0?2:1}" />
            <text x="${lxOut}" y="${lyOut+4}" font-size="9.5" text-anchor="middle" fill="${!openRight?"#DC2626":"#64748B"}" font-weight="700">${outerNum}</text>
            <text x="${lxIn}" y="${lyIn+4}" font-size="9.5" text-anchor="middle" fill="${openRight?"#2563EB":"#64748B"}" font-weight="700">${innerNum}</text>
          `;
        }
        proSvg = `
          <g opacity="0.9">
            <path d="M ${cx - rPro} ${cy} A ${rPro} ${rPro} 0 0 1 ${cx + rPro} ${cy} Z" fill="rgba(224,242,254,0.55)" stroke="#38BDF8" stroke-width="2.5" />
            <line x1="${cx - rPro}" y1="${cy}" x2="${cx + rPro}" y2="${cy}" stroke="#0284C7" stroke-width="2" />
            ${ticks}
          </g>
        `;
      }

      // 角度扇形弧
      let arcSvg = "";
      if (angle > 0 && angle < 360) {
        const rArc = 46;
        const startX = cx + (openRight ? rArc : -rArc);
        const startY = cy;
        const endX = cx + rArc * Math.cos(targetRad);
        const endY = cy + rArc * Math.sin(targetRad);
        const largeArc = angle > 180 ? 1 : 0;
        const sweep = openRight ? 0 : 1;
        arcSvg = `<path d="M ${cx} ${cy} L ${startX} ${startY} A ${rArc} ${rArc} 0 ${largeArc} ${sweep} ${endX} ${endY} Z" fill="rgba(255,122,47,0.28)" stroke="#FF7A2F" stroke-width="2.5" />`;
      } else if (angle === 360) {
        arcSvg = `<circle cx="${cx}" cy="${cy}" r="44" fill="rgba(255,122,47,0.28)" stroke="#FF7A2F" stroke-width="2.5" />`;
      }

      container.innerHTML = `
        <div class="story-bubble">
          📐 <strong>手指直接拖一拖</strong>橙色圆点旋转角，或者点击下方度数按钮！试试切换“开口方向”，看看什么时候该读<strong>内圈刻度</strong>，什么时候读<strong>外圈刻度</strong>！
        </div>
        <div class="lab-controls-row">
          <button class="btn-3d ${showProtractor?"btn-blue":"btn-soft"}" id="ang-toggle-pro">${showProtractor?"🔍 隐藏量角器":"🔍 放上量角器"}</button>
          <button class="btn-3d btn-soft" id="ang-flip">🔄 切换零刻度线在${openRight?"左(读外圈)":"右(读内圈)"}</button>
          <span class="stat-pill" style="font-size:1.05rem;">当前：${angle}° · ${getAngleType(angle)}</span>
        </div>

        <div class="lab-stage" style="padding:10px;">
          <svg id="ang-svg" class="interactive-svg" viewBox="0 0 500 280">
            ${proSvg}
            ${arcSvg}
            <!-- 固定零刻度边 -->
            <line x1="${cx}" y1="${cy}" x2="${x1}" y2="${y1}" stroke="#1E293B" stroke-width="5" stroke-linecap="round" />
            <!-- 旋转活动边 -->
            <line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" stroke="#FF7A2F" stroke-width="5" stroke-linecap="round" />
            <!-- 顶点 -->
            <circle cx="${cx}" cy="${cy}" r="7" fill="#1E293B" />
            <!-- 触控拖拽手柄 -->
            <circle id="ang-handle" cx="${x2}" cy="${y2}" r="16" fill="#FF7A2F" stroke="#FFFFFF" stroke-width="3.5" style="cursor:grab;" />
            <text x="${cx}" y="${cy + 36}" text-anchor="middle" font-size="18" font-weight="900" fill="#EA580C">${angle}° (${getAngleType(angle).split("（")[0]})</text>
          </svg>

          <div style="padding:4px 12px;">
            <input id="ang-slider" type="range" min="0" max="360" value="${angle}" style="width:100%;height:28px;accent-color:#FF7A2F;" />
          </div>
          <div class="lab-controls-row" style="justify-content:center;">
            ${[15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 180, 360].map(d =>
              `<button class="tool-btn ${d===angle?"active":""}" data-deg="${d}">${d}°</button>`
            ).join("")}
          </div>
        </div>

        <div class="formula-banner" style="font-size:1rem;">
          ${openRight
            ? `👀 零刻度线对准<strong>右侧内圈 0°</strong> 👉 请看蓝色的<strong>【内圈刻度】</strong>！`
            : `👀 零刻度线对准<strong>左侧外圈 0°</strong> 👉 请看红色的<strong>【外圈刻度】</strong>！`}
          ${triCombos[angle] ? `<br><span style="color:#059669;">${triCombos[angle]}</span>` : ""}
        </div>
      `;

      container.querySelector("#ang-toggle-pro").addEventListener("click", () => { SoundFX.click(); showProtractor = !showProtractor; draw(); });
      container.querySelector("#ang-flip").addEventListener("click", () => { SoundFX.click(); openRight = !openRight; draw(); });
      container.querySelector("#ang-slider").addEventListener("input", (e) => { angle = Number(e.target.value); draw(); });
      container.querySelectorAll("[data-deg]").forEach((b) => {
        b.addEventListener("click", () => { SoundFX.pop(); angle = Number(b.dataset.deg); draw(); });
      });

      // 支持 iPad / 手机手指直接在 SVG 上拖拽旋转角
      const svg = container.querySelector("#ang-svg");
      let dragging = false;
      function updateFromPointer(ev) {
        const rect = svg.getBoundingClientRect();
        const sx = ((ev.clientX - rect.left) / rect.width) * 500;
        const sy = ((ev.clientY - rect.top) / rect.height) * 280;
        let deg = Math.round((Math.atan2(cy - sy, sx - cx) * 180) / Math.PI);
        if (deg < 0) deg += 360;
        if (!openRight) {
          deg = (180 - deg + 360) % 360;
        }
        // 自动吸附常用整15°附近方便体验，同时保留平滑感
        if (Math.abs(deg - 90) <= 2) deg = 90;
        if (Math.abs(deg - 180) <= 2) deg = 180;
        angle = Math.max(0, Math.min(360, deg));
        draw();
      }
      svg.addEventListener("pointerdown", (e) => { dragging = true; updateFromPointer(e); });
      window.onpointermove = (e) => { if (dragging && document.body.contains(svg)) updateFromPointer(e); };
      window.onpointerup = () => { dragging = false; };
    }
    draw();
  }

  // ==================== 实验室 4：竖式算理拆解机 & 6174数字黑洞 ====================
  function renderMultiply(container) {
    let tab = "vertical";
    let a = 114, b = 21;
    let holeDigits = "2984";

    function draw() {
      let content = "";
      if (tab === "vertical") {
        const cleanA = Math.max(10, Math.min(999, Number(a) || 114));
        const cleanB = Math.max(10, Math.min(99, Number(b) || 21));
        const bOnes = cleanB % 10;
        const bTens = Math.floor(cleanB / 10);
        const step1 = cleanA * bOnes;
        const step2 = cleanA * bTens; // 表示多少个十
        const total = cleanA * cleanB;

        const aH = Math.floor(cleanA / 100);
        const aT = Math.floor((cleanA % 100) / 10);
        const aO = cleanA % 10;

        content = `
          <div class="story-bubble">🛰️ <strong>竖式讲道理</strong>：输入任意两/三位数乘两位数，看看“表格拆分法”和“竖式每一步”是怎么完美对应的！</div>
          <div class="lab-controls-row">
            <input id="mul-a" class="big-input num" type="number" min="10" max="999" value="${cleanA}" style="width:110px;" />
            <strong style="font-size:1.4rem;">×</strong>
            <input id="mul-b" class="big-input num" type="number" min="10" max="99" value="${cleanB}" style="width:95px;" />
            <button class="btn-3d btn-green" id="mul-go">⚡ 拆解算理</button>
            <button class="btn-3d btn-soft" data-ab="14,12">队列表演 14×12</button>
            <button class="btn-3d btn-soft" data-ab="114,21">东方红 114×21</button>
            <button class="btn-3d btn-soft" data-ab="408,23">中间有0: 408×23</button>
          </div>

          <div class="lab-stage" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px;align-items:center;">
            <div style="text-align:center;">
              <div style="font-weight:900;margin-bottom:8px;color:var(--green-dark);">① 竖式对位精解</div>
              <div class="vertical-calc-box num">
                <div>${cleanA}</div>
                <div class="v-line">× &nbsp; ${cleanB}</div>
                <div style="color:#2563EB;">${step1}</div>
                <div class="v-line" style="color:#EA580C;">${step2}&nbsp;</div>
                <div style="color:#059669;font-size:1.5rem;">${total}</div>
              </div>
            </div>

            <div style="line-height:1.8;">
              <div style="font-weight:900;margin-bottom:6px;color:var(--primary-dark);">② 为什么第二行要往左移一位？</div>
              <div style="background:var(--blue-light);padding:10px 14px;border-radius:12px;margin-bottom:8px;">
                🔵 <strong>第一步</strong>：<span class="num">${cleanA} × ${bOnes} ＝ <strong>${step1}</strong></span>（个位上的 ${bOnes} 去乘，末位对齐<strong>个位</strong>）
              </div>
              <div style="background:#FFF7ED;padding:10px 14px;border-radius:12px;margin-bottom:8px;">
                🟠 <strong>第二步</strong>：<span class="num">${cleanA} × ${bTens}0 ＝ <strong>${step2 * 10}</strong></span>（十位上的 ${bTens} 表示 ${bTens}个十，竖式写 <strong class="num">${step2}</strong> 对齐<strong>十位</strong>！）
              </div>
              <div style="background:var(--green-light);padding:10px 14px;border-radius:12px;">
                🟢 <strong>第三步相加</strong>：<span class="num">${step1} ＋ ${step2 * 10} ＝ <strong>${total}</strong></span>
              </div>
            </div>
          </div>

          <div style="overflow-x:auto;margin-top:12px;">
            <table style="width:100%;border-collapse:collapse;background:var(--bg-card);border-radius:12px;overflow:hidden;text-align:center;font-weight:700;">
              <tr style="background:var(--bg-secondary);">
                <th style="padding:10px;border:1px solid var(--border-light);">表格拆分 ×</th>
                ${aH > 0 ? `<th style="padding:10px;border:1px solid var(--border-light);">${aH * 100}</th>` : ""}
                <th style="padding:10px;border:1px solid var(--border-light);">${aT * 10}</th>
                <th style="padding:10px;border:1px solid var(--border-light);">${aO}</th>
              </tr>
              <tr>
                <td style="padding:10px;border:1px solid var(--border-light);background:#FFF7ED;">${bTens * 10}</td>
                ${aH > 0 ? `<td style="padding:10px;border:1px solid var(--border-light);">${aH * 100 * bTens * 10}</td>` : ""}
                <td style="padding:10px;border:1px solid var(--border-light);">${aT * 10 * bTens * 10}</td>
                <td style="padding:10px;border:1px solid var(--border-light);">${aO * bTens * 10}</td>
              </tr>
              <tr>
                <td style="padding:10px;border:1px solid var(--border-light);background:var(--blue-light);">${bOnes}</td>
                ${aH > 0 ? `<td style="padding:10px;border:1px solid var(--border-light);">${aH * 100 * bOnes}</td>` : ""}
                <td style="padding:10px;border:1px solid var(--border-light);">${aT * 10 * bOnes}</td>
                <td style="padding:10px;border:1px solid var(--border-light);">${aO * bOnes}</td>
              </tr>
            </table>
          </div>
        `;
      } else {
        let d4 = String(holeDigits).replace(/\D/g, "").padEnd(4, "1").slice(0, 4);
        const allSame = new Set(d4.split("")).size === 1;
        let stepsHtml = "";
        if (allSame) {
          stepsHtml = `<div class="feedback-banner err">⚠️ 四个数字不能完全一样哦（否则相减得0000），请换四个不全相同的数字试试！</div>`;
        } else {
          let cur = d4;
          for (let step = 1; step <= 7; step++) {
            const arr = cur.padStart(4, "0").split("");
            const maxS = arr.slice().sort((x, y) => y - x).join("");
            const minS = arr.slice().sort((x, y) => x - y).join("");
            const diff = Number(maxS) - Number(minS);
            const diffStr = String(diff).padStart(4, "0");
            const isTarget = diff === 6174;
            stepsHtml += `
              <div class="num" style="padding:10px 16px;margin-bottom:8px;border-radius:12px;background:${isTarget?"#FEF3C7":"var(--bg-card)"};border:2px solid ${isTarget?"#F59E0B":"var(--border-light)"};font-size:1.15rem;font-weight:800;">
                第 ${step} 步：最大 <span style="color:#DC2626;">${maxS}</span> － 最小 <span style="color:#2563EB;">${minS}</span> ＝ <strong style="color:${isTarget?"#D97706":"#059669"};font-size:1.28rem;">${diffStr}</strong> ${isTarget ? "🗝️ 找到智慧城堡钥匙啦！" : ""}
              </div>
            `;
            if (isTarget) break;
            cur = diffStr;
          }
        }

        content = `
          <div class="story-bubble">🏰 <strong>寻找神秘的四位数（课本第52页）</strong>：任选 4 个不完全相同的数字，不断用“最大数－最小数”，看看几步掉进 <strong>6174</strong> 魔法黑洞！</div>
          <div class="lab-controls-row">
            <input id="hole-inp" class="big-input num" maxlength="4" value="${d4}" style="width:150px;letter-spacing:4px;text-align:center;" />
            <button class="btn-3d btn-primary" id="hole-rand">🎲 随机抽4个数字</button>
            <button class="btn-3d btn-soft" id="hole-book">📖 课本示例 2,9,8,4</button>
          </div>
          <div class="lab-stage">${stepsHtml}</div>
        `;
      }

      container.innerHTML = `
        <div class="lab-subtabs">
          <button class="btn-3d ${tab==="vertical"?"btn-green":"btn-soft"}" data-tab="vertical">📝 乘法竖式算理机</button>
          <button class="btn-3d ${tab==="hole"?"btn-green":"btn-soft"}" data-tab="hole">🗝️ 6174 智慧城堡钥匙</button>
        </div>
        ${content}
      `;

      container.querySelectorAll("[data-tab]").forEach(btn => {
        btn.addEventListener("click", () => { SoundFX.click(); tab = btn.dataset.tab; draw(); });
      });

      if (tab === "vertical") {
        container.querySelector("#mul-go").addEventListener("click", () => {
          SoundFX.pop();
          a = container.querySelector("#mul-a").value;
          b = container.querySelector("#mul-b").value;
          draw();
        });
        container.querySelectorAll("[data-ab]").forEach(btn => {
          btn.addEventListener("click", () => {
            SoundFX.pop();
            const parts = btn.dataset.ab.split(",");
            a = Number(parts[0]);
            b = Number(parts[1]);
            draw();
          });
        });
      } else {
        container.querySelector("#hole-inp").addEventListener("input", (e) => {
          const v = e.target.value.replace(/\D/g, "");
          if (v.length === 4) { SoundFX.pop(); holeDigits = v; draw(); }
        });
        container.querySelector("#hole-rand").addEventListener("click", () => {
          SoundFX.pop();
          let r = "";
          do {
            r = String(Math.floor(1000 + Math.random() * 9000));
          } while (new Set(r.split("")).size === 1);
          holeDigits = r;
          draw();
        });
        container.querySelector("#hole-book").addEventListener("click", () => {
          SoundFX.pop();
          holeDigits = "2984";
          draw();
        });
      }
    }
    draw();
  }

  // ==================== 实验室 5：视线盲区（小猴看桃 & 路灯影子） ====================
  function renderSpace(container) {
    let tab = "monkey";
    let monkeyY = 125; // 55(高) ~ 175(低)
    let walkerX = 160; // 70 ~ 470, 路灯在 x=270

    function draw() {
      let body = "";
      if (tab === "monkey") {
        // 树在 x=440，墙在 x=310 (顶 y=155, 底 y=220)，地面 y=220，桃子在 x=60..285
        const treeX = 430;
        const wallX = 305, wallTopY = 152, groundY = 225;
        // 视线经过 (treeX, monkeyY) 和 (wallX, wallTopY) 射向地面 y = groundY
        let hitX = 0;
        if (monkeyY < wallTopY) {
          const slope = (wallTopY - monkeyY) / (wallX - treeX); // 负值
          hitX = wallX + (groundY - wallTopY) / slope;
        } else {
          hitX = -999; // 比墙还矮，看不见地面任何桃子
        }

        const peaches = [65, 100, 135, 170, 205, 235, 262, 285];
        const visibleCount = peaches.filter(px => monkeyY < wallTopY && px <= hitX).length;

        const peachesSvg = peaches.map(px => {
          const canSee = monkeyY < wallTopY && px <= hitX;
          return `
            <g opacity="${canSee ? 1 : 0.3}">
              <circle cx="${px}" cy="${groundY - 9}" r="9" fill="${canSee ? "#FB7185" : "#94A3B8"}" />
              <text x="${px}" y="${groundY - 5}" font-size="11" text-anchor="middle">${canSee ? "🍑" : "🔒"}</text>
            </g>
          `;
        }).join("");

        const blindPoly = monkeyY < wallTopY
          ? `<polygon points="${Math.max(20, hitX)},${groundY} ${wallX},${groundY} ${wallX},${wallTopY}" fill="rgba(100,116,139,0.25)" />`
          : `<rect x="20" y="${wallTopY}" width="${wallX - 20}" height="${groundY - wallTopY}" fill="rgba(100,116,139,0.28)" />`;

        body = `
          <div class="story-bubble">🐒 <strong>小猴爬树看桃子（课本第59页）</strong>：拖动滑块让小猴往树上爬，观察直直的<strong>视线</strong>与灰色<strong>盲区</strong>怎样变化！</div>
          <div class="lab-stage" style="padding:12px;">
            <svg class="interactive-svg" viewBox="0 0 500 250">
              <rect x="0" y="0" width="500" height="225" fill="#F0F9FF" rx="12" />
              <line x1="15" y1="${groundY}" x2="485" y2="${groundY}" stroke="#65A30D" stroke-width="5" />
              <!-- 大树 -->
              <rect x="${treeX - 10}" y="55" width="20" height="170" fill="#92400E" rx="4" />
              <circle cx="${treeX}" cy="48" r="38" fill="#22C55E" />
              <circle cx="${treeX - 26}" cy="62" r="26" fill="#16A34A" />
              <circle cx="${treeX + 26}" cy="62" r="26" fill="#16A34A" />
              <!-- 盲区阴影 -->
              ${blindPoly}
              <!-- 围墙 -->
              <rect x="${wallX - 6}" y="${wallTopY}" width="12" height="${groundY - wallTopY}" fill="#64748B" rx="2" />
              <text x="${wallX}" y="${wallTopY - 6}" font-size="12" text-anchor="middle" fill="#334155" font-weight="800">残墙</text>
              <!-- 视线 -->
              ${monkeyY < wallTopY
                ? `<line x1="${treeX}" y1="${monkeyY}" x2="${Math.max(10, hitX)}" y2="${groundY}" stroke="#F59E0B" stroke-width="3" stroke-dasharray="6,4" />`
                : `<line x1="${treeX}" y1="${monkeyY}" x2="20" y2="${monkeyY - 25}" stroke="#EF4444" stroke-width="2.5" stroke-dasharray="5,5" />`}
              <!-- 桃子们 -->
              ${peachesSvg}
              <!-- 小猴 -->
              <text x="${treeX}" y="${monkeyY + 8}" font-size="28" text-anchor="middle">🐒</text>
            </svg>
            <div class="lab-controls-row" style="justify-content:center;">
              <span>👇 爬低点</span>
              <input id="mk-slider" type="range" min="58" max="165" value="${223 - monkeyY}" style="width:240px;accent-color:#F59E0B;" />
              <span>👆 爬高点</span>
            </div>
          </div>
          <div class="formula-banner">
            🍑 墙内共有 <strong>8</strong> 个桃子，当前高度小猴能看到 <strong>${visibleCount}</strong> 个桃子，盲区藏着 <strong>${8 - visibleCount}</strong> 个！<br>
            <small>结论：小猴爬得越<strong>高</strong>，盲区越<strong>小</strong>，看到的桃子越<strong>多</strong>！</small>
          </div>
        `;
      } else {
        // 夜晚路灯影子：路灯 x=250, 灯高 y=42，地面 y=220，杆子/人高 55 (顶 y=165)
        const lampX = 250, lampY = 42, groundY = 220, personH = 54;
        const headY = groundY - personH;
        // 光线从 (lampX, lampY) 过 (walkerX, headY) 到 y=groundY
        const dx = walkerX - lampX;
        const shadowTipX = lampX + (dx * (groundY - lampY)) / (headY - lampY);
        const shadowLen = Math.round(Math.abs(shadowTipX - walkerX));

        body = `
          <div class="story-bubble">🏮 <strong>夜晚路灯下的影子（课本第59页）</strong>：左右移动滑块让小杆子走过路灯下方，看看影子长度怎么变！</div>
          <div class="lab-stage" style="padding:12px;">
            <svg class="interactive-svg" viewBox="0 0 500 245">
              <rect x="0" y="0" width="500" height="220" fill="#1E293B" rx="12" />
              <circle cx="${lampX}" cy="${lampY}" r="26" fill="rgba(253,224,71,0.28)" />
              <!-- 路灯杆 -->
              <line x1="${lampX}" y1="${lampY}" x2="${lampX}" y2="${groundY}" stroke="#94A3B8" stroke-width="5" />
              <circle cx="${lampX}" cy="${lampY}" r="9" fill="#FDE047" />
              <!-- 地面 -->
              <line x1="10" y1="${groundY}" x2="490" y2="${groundY}" stroke="#475569" stroke-width="5" />
              <!-- 光线 -->
              <line x1="${lampX}" y1="${lampY}" x2="${shadowTipX}" y2="${groundY}" stroke="#FDE047" stroke-width="2" stroke-dasharray="5,4" />
              <!-- 地面影子 -->
              <line x1="${walkerX}" y1="${groundY}" x2="${shadowTipX}" y2="${groundY}" stroke="#0F172A" stroke-width="8" stroke-linecap="round" />
              <!-- 移动标杆 -->
              <line x1="${walkerX}" y1="${headY}" x2="${walkerX}" y2="${groundY}" stroke="#38BDF8" stroke-width="6" stroke-linecap="round" />
              <text x="${walkerX}" y="${headY - 8}" fill="#E2E8F0" font-size="12" text-anchor="middle" font-weight="700">标杆</text>
            </svg>
            <div class="lab-controls-row" style="justify-content:center;">
              <span>⬅️ 往左走</span>
              <input id="lamp-slider" type="range" min="95" max="405" value="${walkerX}" style="width:260px;accent-color:#F59E0B;" />
              <span>往右走 ➡️</span>
            </div>
          </div>
          <div class="formula-banner">
            📏 离路灯水平距离：<strong class="num">${Math.abs(walkerX - lampX)}</strong> ｜ 当前影子长度：<strong class="num" style="color:var(--primary-dark);">${shadowLen}</strong><br>
            <small>规律：同样高的杆子，<strong>离路灯越近，影子越短；离路灯越远，影子越长！</strong></small>
          </div>
        `;
      }

      container.innerHTML = `
        <div class="lab-subtabs">
          <button class="btn-3d ${tab==="monkey"?"btn-primary":"btn-soft"}" data-tab="monkey">🐒 小猴爬树看桃子</button>
          <button class="btn-3d ${tab==="lamp"?"btn-primary":"btn-soft"}" data-tab="lamp">🏮 夜晚路灯下的影子</button>
        </div>
        ${body}
      `;

      container.querySelectorAll("[data-tab]").forEach(b => {
        b.addEventListener("click", () => { SoundFX.click(); tab = b.dataset.tab; draw(); });
      });
      if (tab === "monkey") {
        container.querySelector("#mk-slider").addEventListener("input", (e) => {
          monkeyY = 223 - Number(e.target.value);
          draw();
        });
      } else {
        container.querySelector("#lamp-slider").addEventListener("input", (e) => {
          walkerX = Number(e.target.value);
          draw();
        });
      }
    }
    draw();
  }

  // ==================== 实验室 6：瓷砖乘法分配律 & 算24点游戏 ====================
  function renderLaws(container) {
    let tab = "tiles";
    let a = 3, b = 5, c = 8, merged = false;

    const hands24 = [
      { cards: [6, 4, 2, 3], hint: "6 × 4 × (3 － 2) ＝ 24 或 (6 ＋ 4 － 2) × 3 ＝ 24" },
      { cards: [3, 4, 5, 1], hint: "3 × (4 ＋ 5 － 1) ＝ 24 或 5 × (1 ＋ 3) ＋ 4 ＝ 24" },
      { cards: [2, 3, 4, 6], hint: "4 × 6 × (3 － 2) ＝ 24 或 3 × 6 ＋ 2 ＋ 4 ＝ 24" },
      { cards: [1, 2, 3, 8], hint: "8 × 3 × (2 － 1) ＝ 24 或 (8 － 2) × (3 ＋ 1) ＝ 24" },
      { cards: [4, 6, 8, 2], hint: "4 × 8 － 6 － 2 ＝ 24 或 6 × 8 ÷ (4 － 2) ＝ 24" },
      { cards: [5, 5, 2, 2], hint: "5 × 5 － 2 ÷ 2 ＝ 24" }
    ];
    let handIdx = 0;
    let exprTokens = [];
    let usedCardIdx = [];
    let msg24 = "";

    function draw() {
      let body = "";
      if (tab === "tiles") {
        let gridHtml = "";
        for (let r = 0; r < a + b; r++) {
          const isTop = r < a;
          const gapStyle = (!merged && r === a) ? "margin-top:14px;" : "";
          let rowCells = "";
          for (let col = 0; col < c; col++) {
            rowCells += `<span style="display:inline-block;width:24px;height:24px;margin:2px;border-radius:6px;background:${isTop?"#60A5FA":"#F472B6"};border:1.5px solid rgba(255,255,255,0.8);"></span>`;
          }
          gridHtml += `<div style="line-height:1;${gapStyle}">${rowCells}</div>`;
        }

        body = `
          <div class="story-bubble">🧱 <strong>厨房贴瓷砖（课本第72页）</strong>：蓝砖 <strong>${a}</strong> 行，粉砖 <strong>${b}</strong> 行，每行都有 <strong>${c}</strong> 块。点击“拼合/分开”，亲眼见证<strong>乘法分配律</strong>！</div>
          <div class="lab-controls-row">
            <label>蓝砖行数 a：<input id="law-a" type="range" min="1" max="5" value="${a}" style="width:90px;accent-color:#3B82F6;" /> <strong>${a}</strong></label>
            <label>粉砖行数 b：<input id="law-b" type="range" min="1" max="5" value="${b}" style="width:90px;accent-color:#EC4899;" /> <strong>${b}</strong></label>
            <label>每行块数 c：<input id="law-c" type="range" min="3" max="10" value="${c}" style="width:90px;accent-color:#10B981;" /> <strong>${c}</strong></label>
            <button class="btn-3d btn-purple" id="law-merge">${merged ? "✂️ 上下分开算" : "🧲 上下拼合算"}</button>
          </div>
          <div class="lab-stage" style="text-align:center;overflow-x:auto;">
            ${gridHtml}
          </div>
          <div class="formula-banner">
            ${merged
              ? `🧲 合起来算：<strong>(${a} ＋ ${b}) × ${c}</strong> ＝ ${a + b} × ${c} ＝ <strong>${(a + b) * c}（块）</strong>`
              : `✂️ 分开来算：<strong>${a} × ${c} ＋ ${b} × ${c}</strong> ＝ ${a * c} ＋ ${b * c} ＝ <strong>${(a + b) * c}（块）</strong>`}
            <div style="font-size:0.95rem;margin-top:4px;color:#BE185D;">✨ 等式恒成立：(${a} ＋ ${b}) × ${c} ＝ ${a} × ${c} ＋ ${b} × ${c}</div>
          </div>
        `;
      } else {
        const hand = hands24[handIdx];
        const exprStr = exprTokens.map(t => t.label).join(" ");
        body = `
          <div class="story-bubble">🃏 <strong>数学游戏：算24点（课本第65页）</strong>：把下面 4 张牌<strong>全部用上且每张只用一次</strong>，搭配加减乘除和括号算出 <strong>24</strong>！</div>
          <div class="lab-controls-row" style="justify-content:space-between;">
            <span class="stat-pill">第 ${handIdx + 1} / ${hands24.length} 关</span>
            <div style="display:flex;gap:8px;">
              <button class="tool-btn" id="p24-hint">💡 看提示</button>
              <button class="tool-btn" id="p24-next">🔄 换一组牌</button>
            </div>
          </div>
          <div class="lab-stage" style="text-align:center;">
            <div style="display:flex;justify-content:center;gap:12px;margin-bottom:16px;flex-wrap:wrap;">
              ${hand.cards.map((n, idx) => {
                const used = usedCardIdx.includes(idx);
                return `
                  <button class="p24-card" data-cidx="${idx}" ${used ? "disabled" : ""} style="width:72px;height:96px;border-radius:14px;border:3px solid ${used?"#CBD5E1":"#EF4444"};background:${used?"#F1F5F9":"#FFFFFF"};font-size:1.85rem;font-weight:900;color:${used?"#94A3B8":"#DC2626"};cursor:${used?"default":"pointer"};box-shadow:0 4px 10px rgba(0,0,0,0.08);">
                    ♦${n}
                  </button>
                `;
              }).join("")}
            </div>

            <div style="display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin-bottom:14px;">
              ${["+", "-", "×", "÷", "(", ")"].map(op =>
                `<button class="pad-key" data-op="${op}" style="min-width:52px;">${op}</button>`
              ).join("")}
              <button class="pad-key" id="p24-back" style="min-width:68px;background:#FEF2F2;color:#DC2626;">⌫ 退格</button>
              <button class="pad-key" id="p24-clear" style="min-width:68px;">清空</button>
            </div>

            <div class="fill-display" style="max-width:460px;margin:0 auto 14px;justify-content:center;">
              <span>${exprStr || "👆 请依次点击扑克牌和运算符号"}</span>
            </div>

            <button class="btn-3d btn-primary" id="p24-check">🎯 验证是不是 24！</button>
            ${msg24 ? `<div style="margin-top:12px;">${msg24}</div>` : ""}
          </div>
        `;
      }

      container.innerHTML = `
        <div class="lab-subtabs">
          <button class="btn-3d ${tab==="tiles"?"btn-purple":"btn-soft"}" data-tab="tiles">🧱 瓷砖乘法分配律</button>
          <button class="btn-3d ${tab==="game24"?"btn-purple":"btn-soft"}" data-tab="game24">🃏 扑克牌算24点</button>
        </div>
        ${body}
      `;

      container.querySelectorAll("[data-tab]").forEach(b => {
        b.addEventListener("click", () => { SoundFX.click(); tab = b.dataset.tab; draw(); });
      });

      if (tab === "tiles") {
        container.querySelector("#law-a").addEventListener("input", e => { a = Number(e.target.value); draw(); });
        container.querySelector("#law-b").addEventListener("input", e => { b = Number(e.target.value); draw(); });
        container.querySelector("#law-c").addEventListener("input", e => { c = Number(e.target.value); draw(); });
        container.querySelector("#law-merge").addEventListener("click", () => { SoundFX.pop(); merged = !merged; draw(); });
      } else {
        container.querySelectorAll(".p24-card").forEach(card => {
          card.addEventListener("click", () => {
            const idx = Number(card.dataset.cidx);
            if (usedCardIdx.includes(idx)) return;
            // 防止连续点两张数字牌拼成两位数
            const last = exprTokens[exprTokens.length - 1];
            if (last && last.type === "num") {
              msg24 = `<div class="feedback-banner err">⚠️ 两张牌之间要先点加减乘除符号哦，不能把两张牌拼成两位数！</div>`;
              draw();
              return;
            }
            SoundFX.click();
            usedCardIdx.push(idx);
            exprTokens.push({ type: "num", val: hands24[handIdx].cards[idx], label: String(hands24[handIdx].cards[idx]), cidx: idx });
            msg24 = "";
            draw();
          });
        });

        container.querySelectorAll("[data-op]").forEach(b => {
          b.addEventListener("click", () => {
            SoundFX.click();
            const op = b.dataset.op;
            const jsOp = op === "×" ? "*" : op === "÷" ? "/" : op;
            exprTokens.push({ type: "op", val: jsOp, label: op });
            msg24 = "";
            draw();
          });
        });

        container.querySelector("#p24-back").addEventListener("click", () => {
          const popped = exprTokens.pop();
          if (popped && popped.type === "num") {
            usedCardIdx = usedCardIdx.filter(i => i !== popped.cidx);
          }
          msg24 = "";
          draw();
        });

        container.querySelector("#p24-clear").addEventListener("click", () => {
          exprTokens = [];
          usedCardIdx = [];
          msg24 = "";
          draw();
        });

        container.querySelector("#p24-hint").addEventListener("click", () => {
          SoundFX.pop();
          msg24 = `<div class="feedback-banner err">💡 锦囊提示：<strong>${hands24[handIdx].hint}</strong></div>`;
          draw();
        });

        container.querySelector("#p24-next").addEventListener("click", () => {
          SoundFX.click();
          handIdx = (handIdx + 1) % hands24.length;
          exprTokens = [];
          usedCardIdx = [];
          msg24 = "";
          draw();
        });

        container.querySelector("#p24-check").addEventListener("click", () => {
          if (usedCardIdx.length < 4) {
            SoundFX.wrong();
            msg24 = `<div class="feedback-banner err">⚠️ 4 张扑克牌必须全部用上哦（目前用了 ${usedCardIdx.length} 张）！</div>`;
            draw();
            return;
          }
          try {
            const raw = exprTokens.map(t => t.val).join("");
            if (!/^[0-9+\-*/()]+$/.test(raw)) throw new Error("bad");
            const val = Function(`"use strict"; return (${raw});`)();
            if (Math.abs(val - 24) < 1e-6) {
              SoundFX.correct();
              ConfettiFX.burst();
              msg24 = `<div class="feedback-banner ok">🎉 太棒啦！<strong>${exprTokens.map(t=>t.label).join(" ")} ＝ 24</strong>！你真是24点小神算！</div>`;
            } else {
              SoundFX.wrong();
              msg24 = `<div class="feedback-banner err">🤔 算出来的结果是 <strong>${Number(val.toFixed(2))}</strong>，还不是 24 哦，再调整试试！</div>`;
            }
          } catch (err) {
            SoundFX.wrong();
            msg24 = `<div class="feedback-banner err">⚠️ 算式括号或符号还没写完整哦，检查一下吧！</div>`;
          }
          draw();
        });
      }
    }
    draw();
  }

  // ==================== 实验室 7：鼹鼠钻洞与单程车票数线段器 ====================
  function renderCountShapes(container) {
    let n = 5;
    let highlightGroup = 0; // 0: 全部显示, 1..n-1: 从第k个点出发
    const stationNames = ["红薯站", "西红柿站", "茄子站", "胡萝卜站", "土豆站", "南瓜站"];
    const groupColors = ["#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6"];

    function draw() {
      const total = (n * (n - 1)) / 2;
      const formulaParts = [];
      for (let k = n - 1; k >= 1; k--) formulaParts.push(k);

      const xs = [];
      for (let i = 0; i < n; i++) {
        xs.push(55 + (i * 390) / (n - 1));
      }
      const baseY = 185;

      let arcsSvg = "";
      for (let i = 0; i < n - 1; i++) {
        if (highlightGroup !== 0 && highlightGroup !== i + 1) continue;
        const col = groupColors[i % groupColors.length];
        for (let j = i + 1; j < n; j++) {
          const midX = (xs[i] + xs[j]) / 2;
          const span = j - i;
          const ctrlY = baseY - 28 * span - i * 6;
          arcsSvg += `<path d="M ${xs[i]} ${baseY} Q ${midX} ${ctrlY} ${xs[j]} ${baseY}" fill="none" stroke="${col}" stroke-width="3.2" opacity="0.88" />`;
        }
      }

      const nodesSvg = xs.map((x, idx) => `
        <g>
          <circle cx="${x}" cy="${baseY}" r="12" fill="#FFF" stroke="#1E293B" stroke-width="3.5" />
          <text x="${x}" y="${baseY + 5}" font-size="12" font-weight="900" text-anchor="middle">${String.fromCharCode(65 + idx)}</text>
          <text x="${x}" y="${baseY + 30}" font-size="11.5" font-weight="800" fill="#334155" text-anchor="middle">${stationNames[idx]}</text>
        </g>
      `).join("");

      let groupBtns = `<button class="tool-btn ${highlightGroup===0?"active":""}" data-g="0">🌈 显示全部(${total}条)</button>`;
      for (let i = 0; i < n - 1; i++) {
        groupBtns += `<button class="tool-btn ${highlightGroup===i+1?"active":""}" data-g="${i+1}">从${String.fromCharCode(65+i)}出发(${n - 1 - i}条)</button>`;
      }

      container.innerHTML = `
        <div class="story-bubble">🐹 <strong>数图形的学问（课本第77～78页）</strong>：选择车站/洞口数量，点击“从A出发、从B出发……”按顺序点亮弧线，做到<strong>不重复、不遗漏</strong>！</div>
        <div class="lab-controls-row">
          <span>车站/洞口数量：</span>
          ${[3, 4, 5, 6].map(cnt =>
            `<button class="btn-3d ${cnt===n?"btn-blue":"btn-soft"}" data-n="${cnt}">${cnt}个点</button>`
          ).join("")}
        </div>
        <div class="lab-stage" style="padding:12px;">
          <svg class="interactive-svg" viewBox="0 0 500 230">
            <line x1="${xs[0]}" y1="${baseY}" x2="${xs[n - 1]}" y2="${baseY}" stroke="#475569" stroke-width="5" />
            ${arcsSvg}
            ${nodesSvg}
          </svg>
          <div class="lab-controls-row" style="justify-content:center;">${groupBtns}</div>
        </div>
        <div class="formula-banner">
          🎫 单程车票（线段总数）＝ <strong class="num">${formulaParts.join(" ＋ ")} ＝ ${total}（种）</strong><br>
          <small>🚄 如果问<strong>往返双程车票</strong>，就是 ${total} × 2 ＝ <strong>${total * 2}（种）</strong>！</small>
        </div>
      `;

      container.querySelectorAll("[data-n]").forEach(b => {
        b.addEventListener("click", () => { SoundFX.pop(); n = Number(b.dataset.n); highlightGroup = 0; draw(); });
      });
      container.querySelectorAll("[data-g]").forEach(b => {
        b.addEventListener("click", () => { SoundFX.click(); highlightGroup = Number(b.dataset.g); draw(); });
      });
    }
    draw();
  }

  // ==================== 实验室 8：立体图形三合一工坊（切面·搭楼·翻滚正方体） ====================
  function render3DMagic(container) {
    let tab = "roll"; // 默认打开孩子们最好奇的翻滚正方体，也可切换切面与搭楼
    // 切面状态
    let solid = "cylinder", cutType = "horiz";
    // 搭楼状态（2x2 课本第81页）
    let floor1 = [[1, 1], [1, 1]];
    let floor2 = [[1, 0], [0, 1]];
    // 翻滚状态：起点 step=0，1..14
    // 颜色定义：初始在起点时 [top, right, bottom, left] = ["蓝", "黄", "绿", "红"]
    let rollStep = 0;
    let faces = ["蓝", "黄", "绿", "红"]; // 顺时针向右滚1步：newTop = oldLeft, newRight = oldTop, newBottom = oldRight, newLeft = oldBottom
    let bottomHistory = {}; // step -> color

    const colorHex = { "蓝": "#3B82F6", "黄": "#F59E0B", "绿": "#10B981", "红": "#EF4444" };

    function resetRoll() {
      rollStep = 0;
      faces = ["蓝", "黄", "绿", "红"];
      bottomHistory = {};
    }

    function stepForward() {
      if (rollStep >= 14) return;
      rollStep++;
      faces = [faces[3], faces[0], faces[1], faces[2]];
      bottomHistory[rollStep] = faces[2]; // 当前贴在数带上的底面颜色
    }

    function draw() {
      let body = "";
      if (tab === "slice") {
        const infoMap = {
          "cylinder-horiz": { name: "圆形（不管切高切低，圆的大小都一样！）", svg: `<circle cx="120" cy="95" r="52" fill="#60A5FA" stroke="#1D4ED8" stroke-width="4" />` },
          "cylinder-vert":  { name: "长方形（宽是圆柱底面直径，长是高！）", svg: `<rect x="68" y="38" width="104" height="114" fill="#60A5FA" stroke="#1D4ED8" stroke-width="4" rx="3" />` },
          "cylinder-diag":  { name: "椭圆形（就像把装水的圆柱杯斜着拿时的水面！）", svg: `<ellipse cx="120" cy="95" rx="68" ry="42" fill="#60A5FA" stroke="#1D4ED8" stroke-width="4" />` },
          "cone-horiz":     { name: "圆形（越靠近尖顶圆越小，越靠近底面圆越大！）", svg: `<circle cx="80" cy="95" r="24" fill="#FB923C" stroke="#C2410C" stroke-width="3.5" /><circle cx="160" cy="95" r="46" fill="#FB923C" stroke="#C2410C" stroke-width="3.5" />` },
          "cone-vert":      { name: "等腰三角形（沿着圆锥顶点竖直切到底面！）", svg: `<polygon points="120,32 62,154 178,154" fill="#FB923C" stroke="#C2410C" stroke-width="4" />` },
          "cone-diag":      { name: "椭圆形（不穿过底面斜切一刀！）", svg: `<ellipse cx="120" cy="95" rx="58" ry="34" fill="#FB923C" stroke="#C2410C" stroke-width="4" />` },
          "cube-horiz":     { name: "正方形（平行于正方体任意一个面切开！）", svg: `<rect x="68" y="43" width="104" height="104" fill="#A78BFA" stroke="#5B21B6" stroke-width="4" />` },
          "cube-vert":      { name: "长方形（沿着上下底面对角线竖切开！）", svg: `<rect x="52" y="45" width="136" height="100" fill="#A78BFA" stroke="#5B21B6" stroke-width="4" />` },
          "cube-diag":      { name: "三角形（斜着切掉正方体的一个角！）", svg: `<polygon points="120,38 62,148 178,148" fill="#A78BFA" stroke="#5B21B6" stroke-width="4" />` }
        };
        const cur = infoMap[`${solid}-${cutType}`];
        body = `
          <div class="story-bubble">🔪 <strong>切开立体图形（课本第79～80页）</strong>：选一个立体图形，再选一种切法，看看切出来的截面是什么形状！</div>
          <div class="lab-controls-row">
            <strong>选择立体：</strong>
            <button class="tool-btn ${solid==="cylinder"?"active":""}" data-s="cylinder">🥫 圆柱</button>
            <button class="tool-btn ${solid==="cone"?"active":""}" data-s="cone">🥕 圆锥</button>
            <button class="tool-btn ${solid==="cube"?"active":""}" data-s="cube">🧊 正方体</button>
            <strong style="margin-left:8px;">切法：</strong>
            <button class="tool-btn ${cutType==="horiz"?"active":""}" data-c="horiz">➖ 横着平切</button>
            <button class="tool-btn ${cutType==="vert"?"active":""}" data-c="vert">｜ 竖着切(对角切)</button>
            <button class="tool-btn ${cutType==="diag"?"active":""}" data-c="diag">／ 斜着切</button>
          </div>
          <div class="lab-stage" style="text-align:center;">
            <svg width="240" height="185" viewBox="0 0 240 185" style="margin:0 auto;display:block;">${cur.svg}</svg>
            <div style="font-size:1.15rem;font-weight:900;color:var(--primary-dark);">✨ 切面形状：${cur.name}</div>
          </div>
        `;
      } else if (tab === "build") {
        const countBlocks = floor1.flat().reduce((s,x)=>s+x,0) + floor2.flat().reduce((s,x)=>s+x,0);
        // 绘制等轴测小正方体
        function isoCube(cx, cy, fillTop, fillLeft, fillRight) {
          const w = 34, h = 19, v = 34;
          return `
            <g>
              <polygon points="${cx},${cy-h} ${cx+w},${cy} ${cx},${cy+h} ${cx-w},${cy}" fill="${fillTop}" stroke="#1E293B" stroke-width="2" />
              <polygon points="${cx-w},${cy} ${cx},${cy+h} ${cx},${cy+h+v} ${cx-w},${cy+v}" fill="${fillLeft}" stroke="#1E293B" stroke-width="2" />
              <polygon points="${cx},${cy+h} ${cx+w},${cy} ${cx+w},${cy+v} ${cx},${cy+h+v}" fill="${fillRight}" stroke="#1E293B" stroke-width="2" />
            </g>
          `;
        }
        let cubesSvg = "";
        // 按从后往前顺序绘制防止遮挡：(0,0) -> (0,1) & (1,0) -> (1,1)
        const order = [[0,0], [0,1], [1,0], [1,1]];
        order.forEach(([r, c]) => {
          const baseX = 150 + (c - r) * 34;
          const baseY = 95 + (c + r) * 19;
          if (floor1[r][c] === 1) {
            cubesSvg += isoCube(baseX, baseY, "#60A5FA", "#3B82F6", "#2563EB");
          }
          if (floor2[r][c] === 1) {
            cubesSvg += isoCube(baseX, baseY - 34, "#FBBF24", "#F59E0B", "#D97706");
          }
        });

        function renderGrid(fl, flNum) {
          return `
            <div style="text-align:center;">
              <div style="font-weight:900;margin-bottom:6px;">第 ${flNum} 层图纸</div>
              <div style="display:grid;grid-template-columns:repeat(2,56px);gap:6px;justify-content:center;">
                ${fl.map((row, r) => row.map((val, c) => `
                  <button class="pad-key" data-fl="${flNum}" data-r="${r}" data-c="${c}" style="height:56px;background:${val?(flNum===1?"#DBEAFE":"#FEF3C7"):"var(--bg-card)"};border-color:${val?"#3B82F6":"var(--border-light)"};">
                    ${val}
                  </button>
                `).join("")).join("")}
              </div>
            </div>
          `;
        }

        body = `
          <div class="story-bubble">🏗️ <strong>搭建立体大楼（课本第81页）</strong>：点击图纸格子切换 <code>1</code>（放正方体）和 <code>0</code>（空位），右边实时搭出3D立体大楼！</div>
          <div class="lab-stage" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:18px;align-items:center;">
            <div style="display:flex;justify-content:space-around;gap:12px;">
              ${renderGrid(floor1, 1)}
              ${renderGrid(floor2, 2)}
            </div>
            <div style="text-align:center;">
              <svg width="300" height="200" viewBox="0 0 300 200" style="margin:0 auto;display:block;">${cubesSvg}</svg>
              <div style="font-weight:800;">一共用了 <strong class="num" style="color:var(--primary-dark);font-size:1.3rem;">${countBlocks}</strong> 个小正方体</div>
            </div>
          </div>
        `;
      } else {
        // 翻滚正方体（课本第83~84页）
        let cellsSvg = "";
        const startX = 18, cellW = 31, beltY = 135;
        for (let i = 0; i <= 14; i++) {
          const x = startX + i * cellW;
          const histCol = bottomHistory[i] ? colorHex[bottomHistory[i]] : "#FFFFFF";
          const isBlueHit = bottomHistory[i] === "蓝";
          cellsSvg += `
            <g>
              <rect x="${x}" y="${beltY}" width="${cellW}" height="34" fill="${histCol}" fill-opacity="${bottomHistory[i]?0.28:1}" stroke="${isBlueHit?"#2563EB":"#94A3B8"}" stroke-width="${isBlueHit?2.8:1.5}" />
              <text x="${x + cellW/2}" y="${beltY + 22}" font-size="${i===0?10:12}" font-weight="900" text-anchor="middle" fill="${isBlueHit?"#1D4ED8":"#1E293B"}">${i===0?"起点":i}</text>
            </g>
          `;
        }
        const cubeX = startX + rollStep * cellW;
        const cubeY = beltY - 31;
        const blueNums = Object.keys(bottomHistory).filter(k => bottomHistory[k] === "蓝");

        body = `
          <div class="story-bubble">🎲 <strong>翻滚正方体（课本第83页）</strong>：起点时<strong>蓝色面在正上方（顶面）</strong>！点击“向右翻滚1步”，观察蓝色面每次踩中哪些数字！</div>
          <div class="lab-controls-row">
            <button class="btn-3d btn-primary" id="roll-one">➡️ 向右翻滚 1 步</button>
            <button class="btn-3d btn-blue" id="roll-four">⏩ 连翻 4 步（一圈）</button>
            <button class="btn-3d btn-soft" id="roll-reset">🔄 回到起点</button>
          </div>
          <div class="lab-stage" style="padding:12px;">
            <svg class="interactive-svg" viewBox="0 0 490 190">
              ${cellsSvg}
              <!-- 当前正方体侧面示意（清晰展示顶/右/底/左四色方位） -->
              <g>
                <rect x="${cubeX}" y="${cubeY}" width="${cellW}" height="31" fill="#F8FAFC" stroke="#1E293B" stroke-width="2" />
                <!-- 顶面色条 -->
                <line x1="${cubeX}" y1="${cubeY}" x2="${cubeX + cellW}" y2="${cubeY}" stroke="${colorHex[faces[0]]}" stroke-width="7" />
                <!-- 右面色条 -->
                <line x1="${cubeX + cellW}" y1="${cubeY}" x2="${cubeX + cellW}" y2="${cubeY + 31}" stroke="${colorHex[faces[1]]}" stroke-width="6" />
                <!-- 底面色条 -->
                <line x1="${cubeX}" y1="${cubeY + 31}" x2="${cubeX + cellW}" y2="${cubeY + 31}" stroke="${colorHex[faces[2]]}" stroke-width="7" />
                <!-- 左面色条 -->
                <line x1="${cubeX}" y1="${cubeY}" x2="${cubeX}" y2="${cubeY + 31}" stroke="${colorHex[faces[3]]}" stroke-width="6" />
                <text x="${cubeX + cellW/2}" y="${cubeY - 10}" font-size="11" font-weight="900" text-anchor="middle" fill="${colorHex[faces[0]]}">顶:${faces[0]}</text>
              </g>
            </svg>
          </div>
          <div class="formula-banner">
            📍 当前位置：<strong>${rollStep === 0 ? "起点" : "数字 " + rollStep}</strong>（此时贴地底面是 <strong>${faces[2]}色</strong>，顶面是 <strong>${faces[0]}色</strong>）<br>
            🔵 蓝色面已踩中的数字：<strong class="num" style="color:#2563EB;">${blueNums.length ? blueNums.join(" ， ") : "（快向右翻2步看看！）"}</strong> （规律：每次相差 <strong>4</strong>！）
          </div>
        `;
      }

      container.innerHTML = `
        <div class="lab-subtabs">
          <button class="btn-3d ${tab==="roll"?"btn-blue":"btn-soft"}" data-tab="roll">🎲 翻滚正方体</button>
          <button class="btn-3d ${tab==="build"?"btn-blue":"btn-soft"}" data-tab="build">🏗️ 0和1图纸搭大楼</button>
          <button class="btn-3d ${tab==="slice"?"btn-blue":"btn-soft"}" data-tab="slice">🔪 切开立体图形</button>
        </div>
        ${body}
      `;

      container.querySelectorAll("[data-tab]").forEach(b => {
        b.addEventListener("click", () => { SoundFX.click(); tab = b.dataset.tab; draw(); });
      });

      if (tab === "slice") {
        container.querySelectorAll("[data-s]").forEach(b => {
          b.addEventListener("click", () => { SoundFX.pop(); solid = b.dataset.s; draw(); });
        });
        container.querySelectorAll("[data-c]").forEach(b => {
          b.addEventListener("click", () => { SoundFX.pop(); cutType = b.dataset.c; draw(); });
        });
      } else if (tab === "build") {
        container.querySelectorAll("[data-fl]").forEach(b => {
          b.addEventListener("click", () => {
            SoundFX.pop();
            const fl = Number(b.dataset.fl), r = Number(b.dataset.r), c = Number(b.dataset.c);
            if (fl === 1) {
              floor1[r][c] = floor1[r][c] ? 0 : 1;
              if (floor1[r][c] === 0) floor2[r][c] = 0; // 一层抽走，二层自动落下清零防悬空
            } else {
              floor2[r][c] = floor2[r][c] ? 0 : 1;
              if (floor2[r][c] === 1) floor1[r][c] = 1; // 二层放块自动补齐一层地基
            }
            draw();
          });
        });
      } else {
        container.querySelector("#roll-one").addEventListener("click", () => { SoundFX.pop(); stepForward(); draw(); });
        container.querySelector("#roll-four").addEventListener("click", () => {
          SoundFX.correct();
          for (let k = 0; k < 4; k++) stepForward();
          draw();
        });
        container.querySelector("#roll-reset").addEventListener("click", () => { SoundFX.click(); resetRoll(); draw(); });
      }
    }
    draw();
  }

  // ==================== 实验室 9：两蔓爬墙与相遇问题动态剧场 ====================
  function renderRelations(container) {
    let mode = "vines"; // vines: 九章算术两蔓爬墙, walk: 淘气笑笑相遇
    let t = 0;

    const configs = {
      vines: {
        title: "🌿 《九章算术》两蔓爬墙（墙高9尺＝90寸）",
        total: 90, v1: 5, v2: 10, unitLen: "寸", unitTime: "日",
        name1: "瓜蔓(从上往下)", name2: "葫芦蔓(从下往上)", e1: "🥒", e2: "🍐"
      },
      walk: {
        title: "🏃 笑笑与淘气同时相向出发（相距800米）",
        total: 800, v1: 40, v2: 60, unitLen: "米", unitTime: "分钟",
        name1: "笑笑(40米/分)", name2: "淘气(60米/分)", e1: "👧", e2: "👦"
      }
    };

    function draw() {
      const cfg = configs[mode];
      const maxT = cfg.total / (cfg.v1 + cfg.v2);
      if (t > maxT) t = maxT;
      const d1 = cfg.v1 * t;
      const d2 = cfg.v2 * t;
      const remain = Math.max(0, cfg.total - d1 - d2);

      const xStart = 55, xEnd = 445, trackLen = xEnd - xStart;
      const pos1 = xStart + (d1 / cfg.total) * trackLen;
      const pos2 = xEnd - (d2 / cfg.total) * trackLen;

      container.innerHTML = `
        <div class="lab-subtabs">
          <button class="btn-3d ${mode==="vines"?"btn-primary":"btn-soft"}" data-m="vines">🌿 九章算术：两蔓相遇</button>
          <button class="btn-3d ${mode==="walk"?"btn-primary":"btn-soft"}" data-m="walk">🏃 淘气笑笑相向而行</button>
        </div>

        <div class="story-bubble">⏱️ <strong>${cfg.title}</strong>：点击“前进 1 ${cfg.unitTime}”或拖动时间轴，观察各自走的路程与<strong>速度和</strong>！</div>

        <div class="lab-controls-row">
          <button class="btn-3d btn-green" id="rel-step">➕ 前进 1 ${cfg.unitTime}</button>
          <button class="btn-3d btn-blue" id="rel-end">🎯 直接跳到相遇时刻</button>
          <button class="btn-3d btn-soft" id="rel-zero">🔄 回到出发(0${cfg.unitTime})</button>
        </div>

        <div class="lab-stage" style="padding:14px;">
          <svg class="interactive-svg" viewBox="0 0 500 165">
            <!-- 总路程底轨 -->
            <line x1="${xStart}" y1="95" x2="${xEnd}" y2="95" stroke="#E2E8F0" stroke-width="14" stroke-linecap="round" />
            <!-- 甲走过的轨迹 -->
            <line x1="${xStart}" y1="95" x2="${pos1}" y2="95" stroke="#10B981" stroke-width="14" stroke-linecap="round" />
            <!-- 乙走过的轨迹 -->
            <line x1="${xEnd}" y1="95" x2="${pos2}" y2="95" stroke="#F97316" stroke-width="14" stroke-linecap="round" />
            <!-- 角色图标 -->
            <text x="${pos1}" y="72" font-size="28" text-anchor="middle">${cfg.e1}</text>
            <text x="${pos2}" y="72" font-size="28" text-anchor="middle">${cfg.e2}</text>
            ${remain === 0 ? `<text x="${pos1}" y="36" font-size="16" font-weight="900" fill="#DC2626" text-anchor="middle">🎉 相遇啦！(第${maxT}${cfg.unitTime})</text>` : ""}
            <text x="${xStart}" y="132" font-size="12" font-weight="800" fill="#059669">${cfg.name1}：已行 ${d1}${cfg.unitLen}</text>
            <text x="${xEnd}" y="132" font-size="12" font-weight="800" fill="#EA580C" text-anchor="end">${cfg.name2}：已行 ${d2}${cfg.unitLen}</text>
            <text x="250" y="154" font-size="13" font-weight="900" fill="#334155" text-anchor="middle">总路程 ${cfg.total}${cfg.unitLen} ｜ 剩余相距：${remain}${cfg.unitLen}</text>
          </svg>
          <input id="rel-slider" type="range" min="0" max="${maxT}" step="1" value="${t}" style="width:100%;accent-color:#FF7A2F;" />
        </div>

        <div class="formula-banner">
          ⚡ 速度和 ＝ <span class="num">${cfg.v1} ＋ ${cfg.v2} ＝ <strong>${cfg.v1 + cfg.v2}（${cfg.unitLen}/${cfg.unitTime}）</strong></span><br>
          ⏱️ 已用时间：<strong class="num">${t} ${cfg.unitTime}</strong> ｜ 相遇总时间 ＝ <span class="num">${cfg.total} ÷ ${cfg.v1 + cfg.v2} ＝ <strong>${maxT}（${cfg.unitTime}）</strong></span>
        </div>
      `;

      container.querySelectorAll("[data-m]").forEach(b => {
        b.addEventListener("click", () => { SoundFX.click(); mode = b.dataset.m; t = 0; draw(); });
      });
      container.querySelector("#rel-step").addEventListener("click", () => {
        if (t < maxT) {
          t++;
          if (t === maxT) SoundFX.correct(); else SoundFX.pop();
          draw();
        }
      });
      container.querySelector("#rel-end").addEventListener("click", () => { SoundFX.correct(); t = maxT; draw(); });
      container.querySelector("#rel-zero").addEventListener("click", () => { SoundFX.click(); t = 0; draw(); });
      container.querySelector("#rel-slider").addEventListener("input", e => { t = Number(e.target.value); draw(); });
    }
    draw();
  }

  // ==================== 实验室 10：条形统计图创意画板 ====================
  function renderDataChart(container) {
    let scale = 5; // 1格表示 1 / 2 / 5 人
    let data = [
      { name: "春季", val: 37, color: "#10B981" },
      { name: "夏季", val: 36, color: "#F59E0B" },
      { name: "秋季", val: 41, color: "#F97316" },
      { name: "冬季", val: 53, color: "#3B82F6" }
    ];

    function draw() {
      const maxVal = Math.max(...data.map(d => d.val), scale * 6);
      const gridCount = Math.min(14, Math.max(8, Math.ceil(maxVal / scale) + 1));
      const topLimit = gridCount * scale;
      const total = data.reduce((s, d) => s + d.val, 0);
      const sorted = [...data].sort((a, b) => b.val - a.val);

      const chartH = 200, chartLeft = 58, chartRight = 450, chartBottom = 225;

      let linesSvg = "";
      for (let g = 0; g <= gridCount; g++) {
        const y = chartBottom - (g / gridCount) * chartH;
        linesSvg += `
          <line x1="${chartLeft}" y1="${y}" x2="${chartRight}" y2="${y}" stroke="${g===0?"#334155":"#CBD5E1"}" stroke-width="${g===0?2.5:1}" />
          <text x="${chartLeft - 8}" y="${y + 4}" font-size="11" font-weight="700" text-anchor="end" fill="#475569">${g * scale}</text>
        `;
      }

      const barsSvg = data.map((d, i) => {
        const bw = 50;
        const bx = chartLeft + 35 + i * 92;
        const clamped = Math.min(d.val, topLimit);
        const bh = (clamped / topLimit) * chartH;
        const by = chartBottom - bh;
        return `
          <g>
            <rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="${d.color}" rx="6" />
            <text x="${bx + bw/2}" y="${by - 6}" font-size="13" font-weight="900" text-anchor="middle" fill="#1E293B">${d.val}${d.val > topLimit ? "(超格!)" : ""}</text>
            <text x="${bx + bw/2}" y="${chartBottom + 20}" font-size="13" font-weight="800" text-anchor="middle" fill="#334155">${d.name}</text>
          </g>
        `;
      }).join("");

      container.innerHTML = `
        <div class="story-bubble">📊 <strong>四年级同学生日季节统计图（课本第95页）</strong>：试试切换“1格表示几人”，如果人数达到53人但1格只表示1人或2人，格子够画吗？</div>
        <div class="lab-controls-row">
          <strong>切换纵轴刻度：</strong>
          ${[1, 2, 5, 10].map(sc =>
            `<button class="btn-3d ${sc===scale?"btn-blue":"btn-soft"}" data-sc="${sc}">1格表示 ${sc} 人</button>`
          ).join("")}
        </div>

        <div class="lab-stage" style="padding:12px;">
          <svg class="interactive-svg" viewBox="0 0 490 255">
            <text x="255" y="18" font-size="14" font-weight="900" text-anchor="middle" fill="#1E293B">四年级同学生日季节条形统计图（1格＝${scale}人）</text>
            <line x1="${chartLeft}" y1="20" x2="${chartLeft}" y2="${chartBottom}" stroke="#334155" stroke-width="2.5" />
            ${linesSvg}
            ${barsSvg}
          </svg>

          <div style="display:flex;justify-content:center;gap:12px;flex-wrap:wrap;margin-top:8px;">
            ${data.map((d, idx) => `
              <div style="background:var(--bg-card);padding:6px 12px;border-radius:12px;border:1.5px solid var(--border-light);display:flex;align-items:center;gap:6px;">
                <strong>${d.name}</strong>
                <button class="tool-btn" data-idx="${idx}" data-delta="-1" style="min-height:34px;padding:2px 10px;">－</button>
                <span class="num" style="font-weight:900;min-width:26px;text-align:center;">${d.val}</span>
                <button class="tool-btn" data-idx="${idx}" data-delta="1" style="min-height:34px;padding:2px 10px;">＋</button>
              </div>
            `).join("")}
          </div>
        </div>

        <div class="formula-banner" style="font-size:1rem;">
          📈 统计发现：共调查 <strong class="num">${total}</strong> 人，<strong>${sorted[0].name}</strong>过生日最多（${sorted[0].val}人），<strong>${sorted[sorted.length-1].name}</strong>最少（${sorted[sorted.length-1].val}人），相差 <strong>${sorted[0].val - sorted[sorted.length-1].val}</strong> 人！
          ${sorted[0].val > topLimit ? `<br><span style="color:#DC2626;">⚠️ 注意：当前1格只表示${scale}人，14格最多只能画到${topLimit}人，快把刻度调成“1格表示5人”吧！</span>` : ""}
        </div>
      `;

      container.querySelectorAll("[data-sc]").forEach(b => {
        b.addEventListener("click", () => { SoundFX.pop(); scale = Number(b.dataset.sc); draw(); });
      });
      container.querySelectorAll("[data-delta]").forEach(b => {
        b.addEventListener("click", () => {
          SoundFX.click();
          const idx = Number(b.dataset.idx);
          const delta = Number(b.dataset.delta);
          data[idx].val = Math.max(0, data[idx].val + delta);
          draw();
        });
      });
    }
    draw();
  }

  // ==================== 实验室 11：北斗导航步行时间模拟器 ====================
  function renderNavigation(container) {
    let dist = 800; // 米
    let mySpeed = 66; // 米/分
    let redLights = 1; // 每个红灯平均等 35 秒
    let crowded = false;

    function draw() {
      // 导航默认按约 66.7米/分（即800米12分钟）估算基础步行时间，拥堵时上浮约15%
      const navEstMin = Math.round((dist / 66.7) * (crowded ? 1.15 : 1));
      const trackLaps = (dist / 200).toFixed(1);
      const pureWalkSec = Math.round((dist / mySpeed) * 60);
      const extraSec = redLights * 35 + (crowded ? Math.round(pureWalkSec * 0.12) : 0);
      const actualTotalSec = pureWalkSec + extraSec;
      const actMin = Math.floor(actualTotalSec / 60);
      const actSec = actualTotalSec % 60;

      container.innerHTML = `
        <div class="story-bubble">🧭 <strong>导航给的时间准吗（课本第99～102页）</strong>：调节家校距离、你的步速和路上遇到的红绿灯，对比“北斗导航预计时间”与“模拟实地用时”！</div>
        <div class="lab-stage">
          <div class="lab-controls-row">
            <label style="flex:1;min-width:220px;">
              📏 <strong>步行距离：<span class="num">${dist}</span> 米</strong>（相当于200米跑道 <strong>${trackLaps}</strong> 圈）<br>
              <input id="nav-dist" type="range" min="400" max="2000" step="100" value="${dist}" style="width:100%;accent-color:#0D9488;" />
            </label>
            <label style="flex:1;min-width:220px;">
              👟 <strong>我的步速：<span class="num">${mySpeed}</span> 米/分</strong><br>
              <input id="nav-spd" type="range" min="50" max="90" step="2" value="${mySpeed}" style="width:100%;accent-color:#3B82F6;" />
            </label>
          </div>

          <div class="lab-controls-row">
            <strong>🚦 途中遇到红灯个数：</strong>
            ${[0, 1, 2, 3, 4].map(cnt =>
              `<button class="tool-btn ${cnt===redLights?"active":""}" data-rl="${cnt}">${cnt}个红灯</button>`
            ).join("")}
            <button class="tool-btn ${crowded?"active":""}" id="nav-crowd">${crowded?"🚶‍♂️ 拥堵缓行中":"🛣️ 道路畅通"}</button>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin-top:16px;">
            <div style="background:var(--bg-card);padding:16px;border-radius:16px;border:2px solid #99F6E4;text-align:center;">
              <div style="font-weight:800;color:#0F766E;">📱 导航软件预计时间</div>
              <div class="num" style="font-size:2rem;font-weight:900;color:#0D9488;">约 ${navEstMin} 分钟</div>
              <small style="color:var(--text-muted);">按大众平均步速(约67米/分)计算</small>
            </div>
            <div style="background:var(--bg-card);padding:16px;border-radius:16px;border:2px solid #FDBA74;text-align:center;">
              <div style="font-weight:800;color:#C2410C;">⏱️ 你的实地步行总用时</div>
              <div class="num" style="font-size:2rem;font-weight:900;color:#EA580C;">${actMin} 分 ${actSec} 秒</div>
              <small style="color:var(--text-muted);">纯走路 ${Math.floor(pureWalkSec/60)}分${pureWalkSec%60}秒 ＋ 红灯/拥堵 ${extraSec}秒</small>
            </div>
          </div>
        </div>
        <div class="formula-banner" style="font-size:0.98rem;">
          📝 <strong>小小研究报告结论</strong>：导航预计时间与实际时间<strong>大致接近</strong>，但会受<strong>个人步速快慢、红灯等待（${redLights * 35}秒）和道路拥堵</strong>影响，重要约会记得提前出门哦！
        </div>
      `;

      container.querySelector("#nav-dist").addEventListener("input", e => { dist = Number(e.target.value); draw(); });
      container.querySelector("#nav-spd").addEventListener("input", e => { mySpeed = Number(e.target.value); draw(); });
      container.querySelectorAll("[data-rl]").forEach(b => {
        b.addEventListener("click", () => { SoundFX.click(); redLights = Number(b.dataset.rl); draw(); });
      });
      container.querySelector("#nav-crowd").addEventListener("click", () => { SoundFX.pop(); crowded = !crowded; draw(); });
    }
    draw();
  }

  // ==================== 实验室 12：神奇的 142857 走马灯密码宝盒 ====================
  function render142857(container) {
    let k = 1;
    const base = 142857;
    const ringColors = ["#EF4444", "#F97316", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6"];
    const origDigits = ["1", "4", "2", "8", "5", "7"];

    function draw() {
      const prod = String(base * k);
      const isSeven = k === 7;

      const digitCards = prod.split("").map((d) => {
        const origIdx = origDigits.indexOf(d);
        const bg = isSeven ? "#F59E0B" : ringColors[origIdx >= 0 ? origIdx : 0];
        return `
          <div class="num" style="width:52px;height:66px;border-radius:14px;background:${bg};color:#FFF;font-size:1.85rem;font-weight:900;display:flex;align-items:center;justify-content:center;box-shadow:0 5px 12px rgba(0,0,0,0.15);">
            ${d}
          </div>
        `;
      }).join("");

      container.innerHTML = `
        <div class="story-bubble">👑 <strong>总复习终极彩蛋：神奇的 142857（课本第105页第8题）</strong>：依次点击 ×1 到 ×7，注意观察每个颜色数字方块是怎么排着队“转圈圈”的！</div>
        <div class="lab-controls-row" style="justify-content:center;">
          ${[1, 2, 3, 4, 5, 6, 7].map(m =>
            `<button class="btn-3d ${m===k?(m===7?"btn-primary":"btn-purple"):"btn-soft"}" data-k="${m}">142857 × ${m}</button>`
          ).join("")}
        </div>
        <div class="lab-stage" style="text-align:center;padding:24px 14px;">
          <div class="num" style="font-size:1.3rem;font-weight:900;margin-bottom:14px;">
            142857 × ${k} ＝
          </div>
          <div style="display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin-bottom:16px;">
            ${digitCards}
          </div>
          <div style="font-weight:800;font-size:1.05rem;color:${isSeven?"#D97706":"var(--purple-dark)"};">
            ${isSeven
              ? "🎆 哇！！乘 7 的瞬间，走马灯停下来全部变成了六个 9（999999），宝盒彻底打开啦！"
              : `🎡 仔细看颜色顺序：仍然是 <strong>1→4→2→8→5→7</strong> 首尾相连绕圈，只是换成了从 <strong>${prod[0]}</strong> 开头（因为 7×${k}=${7*k}，个位必是 ${prod[5]}）！`}
          </div>
        </div>
      `;

      container.querySelectorAll("[data-k]").forEach(b => {
        b.addEventListener("click", () => {
          k = Number(b.dataset.k);
          if (k === 7) { SoundFX.fanfare(); ConfettiFX.burst(); } else { SoundFX.pop(); }
          draw();
        });
      });
    }
    draw();
  }

  const registry = {
    "lab-big-numbers": renderBigNumbers,
    "lab-coding": renderCoding,
    "lab-angles": renderAngles,
    "lab-multiply": renderMultiply,
    "lab-space": renderSpace,
    "lab-laws": renderLaws,
    "lab-count-shapes": renderCountShapes,
    "lab-3d-magic": render3DMagic,
    "lab-relations": renderRelations,
    "lab-data-chart": renderDataChart,
    "lab-navigation": renderNavigation,
    "lab-142857": render142857
  };

  return {
    mount(labId, container) {
      const fn = registry[labId];
      if (fn && container) {
        fn(container);
      } else if (container) {
        container.innerHTML = `<p>实验室正在准备中…</p>`;
      }
    }
  };
})();
