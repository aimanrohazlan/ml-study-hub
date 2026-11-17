/* Machine Learning Study Hub: routing, navigation, progress, quiz engine and page renderers. */
(function () {
    'use strict';

    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
    const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const S = ML.store;
    const EXAM_COLOR = '#d97706';

    /* Two-tap confirmation that works where confirm() dialogs are blocked (e.g. inside an embedded viewer). */
    function confirmTap(btn, msg) {
        if (btn.dataset.armed === '1') { btn.dataset.armed = ''; return true; }
        const orig = btn.dataset.orig || btn.textContent;
        btn.dataset.orig = orig; btn.dataset.armed = '1'; btn.textContent = msg;
        clearTimeout(btn._disarm);
        btn._disarm = setTimeout(() => { btn.dataset.armed = ''; btn.textContent = orig; }, 4000);
        return false;
    }

    const GLOBAL_PAGES = [
        { id: 'home', title: 'Quick Start', ico: '⌂' },
        { id: 'cheat', title: 'Master Cheat Sheet', ico: '☰' },
        { id: 'formulas', title: 'Formula Sheet', ico: 'ƒ' },
        { id: 'traps', title: 'Common Confusions', ico: '⚠' },
        { id: 'calc', title: 'Worked Calculations', ico: '∑' },
        { id: 'simulator', title: 'MCQ Simulator', ico: '✓' },
        { id: 'strategy', title: 'Test Strategy', ico: '◎' }
    ];

    /* ---------- Page registry ---------- */
    const PAGES = [];
    GLOBAL_PAGES.forEach(p => PAGES.push({ id: p.id, title: p.title, kind: 'global' }));
    ML.chapters.forEach(ch => {
        ch.topics.forEach(t => PAGES.push({ id: `c${ch.id}-${t.id}`, title: t.title, kind: 'topic', ch, topic: t }));
        PAGES.push({ id: `c${ch.id}-notes`, title: 'Full revision notes', kind: 'notes', ch });
        PAGES.push({ id: `c${ch.id}-subjective`, title: 'Subjective exam prep', kind: 'subjective', ch });
        PAGES.push({ id: `c${ch.id}-mcq`, title: 'MCQ prep', kind: 'mcq', ch });
    });
    const pageById = id => PAGES.find(p => p.id === id);

    /* ---------- Question bank ---------- */
    const BANK = [];
    ML.chapters.forEach(ch => ch.mcq.forEach((m, i) => BANK.push(Object.assign({ id: `c${ch.id}-${i}`, ch: ch.id }, m))));

    /* ---------- Progress helpers ---------- */
    function chapterProgress(ch) {
        const d = S.load();
        const done = ch.topics.filter(t => d.learned[`c${ch.id}-${t.id}`]).length;
        const quiz = d.quiz[`c${ch.id}`];
        return { done, total: ch.topics.length, pct: Math.round(done / ch.topics.length * 100), best: quiz ? quiz.best : null };
    }
    function overall() {
        const d = S.load();
        let done = 0, total = 0;
        ML.chapters.forEach(ch => ch.topics.forEach(t => { total++; if (d.learned[`c${ch.id}-${t.id}`]) done++; }));
        return { done, total, pct: total ? Math.round(done / total * 100) : 0 };
    }

    /* ---------- Theme ---------- */
    function applyTheme(t) {
        if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t);
        else document.documentElement.removeAttribute('data-theme');
    }
    applyTheme(S.pref('theme'));
    function toggleTheme() {
        const cur = document.documentElement.getAttribute('data-theme');
        const sysDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isDark = cur ? cur === 'dark' : sysDark;
        const next = isDark ? 'light' : 'dark';
        applyTheme(next); S.pref('theme', next);
        render(current, true); // redraw canvases with new colours
    }

    /* ---------- Navigation ---------- */
    function buildNav() {
        const nav = $('#nav');
        let html = `<div class="nav-panel"><p class="nav-label">EXAM PREP</p>`;
        GLOBAL_PAGES.forEach(p => {
            html += `<button class="nav-btn" data-nav="${p.id}" style="--navc:${EXAM_COLOR}"><span class="ico">${p.ico}</span>${esc(p.title)}</button>`;
        });
        html += `</div>`;
        ML.chapters.forEach(ch => {
            const pr = chapterProgress(ch);
            html += `<details class="nav-module" data-ch="${ch.id}" style="--navc:${ch.color}">
            <summary><span class="num">${ch.id}</span><span class="mtitle">${esc(ch.short)}<br><span class="mprog">${pr.done}/${pr.total} topics${pr.best != null ? ' · MCQ best ' + pr.best + '%' : ''}</span></span><span class="chev">⌄</span></summary>
            <div class="nav-module-body">`;
            ch.topics.forEach(t => {
                const id = `c${ch.id}-${t.id}`;
                html += `<button class="nav-btn" data-nav="${id}">${esc(t.title)}${S.load().learned[id] ? '<span class="tick">✓</span>' : ''}</button>`;
            });
            html += `<div class="nav-sep"></div>
                <button class="nav-btn" data-nav="c${ch.id}-notes"><span class="ico">✎</span>Full revision notes</button>
                <button class="nav-btn" data-nav="c${ch.id}-subjective"><span class="ico">✍</span>Subjective exam prep</button>
                <button class="nav-btn" data-nav="c${ch.id}-mcq"><span class="ico">✓</span>MCQ prep</button>
            </div></details>`;
        });
        nav.innerHTML = html;
        updateOverall();
    }
    function updateOverall() {
        const o = overall();
        $('#overall-progress').innerHTML = `${o.done} of ${o.total} topics learned · ${o.pct}%<div class="bar"><i style="width:${o.pct}%"></i></div>`;
    }
    function syncNav(id) {
        $$('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.nav === id));
        const p = pageById(id);
        if (p && p.ch) {
            const det = $(`.nav-module[data-ch="${p.ch.id}"]`);
            if (det && !det.open) det.open = true;
        }
        const active = $('.nav-btn.active');
        if (active && window.innerWidth > 900) {
            const sb = $('#sidebar'), r = active.getBoundingClientRect();
            if (r.top < 0 || r.bottom > window.innerHeight) active.scrollIntoView({ block: 'center' });
            void sb;
        }
    }

    /* ---------- Router ---------- */
    let current = 'home';
    function navTo(id) {
        if (!pageById(id)) id = 'home';
        if (location.hash !== '#' + id) location.hash = id; else render(id);
    }
    window.addEventListener('hashchange', () => render(location.hash.slice(1) || 'home'));

    function setColor(color) { document.documentElement.style.setProperty('--c', color); }

    function render(id, keepScroll) {
        stopTimer();
        const prevY = window.scrollY;
        const p = pageById(id) || pageById('home');
        current = p.id;
        S.pref('last', p.id);
        const page = $('#page');
        setColor(p.ch ? p.ch.color : EXAM_COLOR);

        let html = '';
        switch (p.kind) {
            case 'global': html = GLOBAL_RENDER[p.id](); break;
            case 'topic': html = renderTopic(p); break;
            case 'notes': html = renderNotes(p); break;
            case 'subjective': html = renderSubjective(p); break;
            case 'mcq': html = renderMcqPrep(p); break;
        }
        page.innerHTML = html;
        $('#crumbs').innerHTML = p.ch
            ? `Chapter ${p.ch.id} · ${esc(p.ch.title)} › <b>${esc(p.title)}</b>`
            : `Exam prep › <b>${esc(p.title)}</b>`;
        renderPager(p);
        afterRender(page);
        syncNav(p.id);
        closeSidebar();
        document.title = (p.id === 'home' ? '' : p.title + ' · ') + 'Machine Learning Study Hub';
        const root = document.documentElement, sb = root.style.scrollBehavior;
        root.style.scrollBehavior = 'auto';
        window.scrollTo(0, keepScroll ? prevY : 0);
        root.style.scrollBehavior = sb;
        if (!keepScroll) page.focus({ preventScroll: true });
        if (p.id === 'simulator') simSetupInit();
        if (p.id === 'formulas') ffApply();
    }

    function afterRender(root) {
        if (typeof renderMathInElement === 'function') {
            try {
                renderMathInElement(root, {
                    delimiters: [{ left: '$$', right: '$$', display: true }, { left: '$', right: '$', display: false }],
                    ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code', 'option'],
                    throwOnError: false
                });
            } catch (e) { /* ignore */ }
        }
        $$('[data-vis]', root).forEach(el => {
            const fn = ML.vis[el.dataset.vis];
            if (fn && !el.dataset.ready) {
                el.dataset.ready = '1';
                try { fn(el); } catch (e) { el.innerHTML = '<p class="muted small">Interactive visual failed to load.</p>'; console.error(e); }
            }
        });
    }

    function renderPager(p) {
        const order = PAGES;
        const i = order.indexOf(p);
        const prev = order[i - 1], next = order[i + 1];
        const label = q => q.ch ? `Ch ${q.ch.id} · ${q.title}` : q.title;
        $('#pager').innerHTML =
            (prev ? `<a href="#${prev.id}" class="prev"><small>← Previous</small><span>${esc(label(prev))}</span></a>` : '<span></span>') +
            (next ? `<a href="#${next.id}" class="next"><small>Next →</small><span>${esc(label(next))}</span></a>` : '');
    }

    /* ---------- Chapter pages ---------- */
    function chapterHero(p, sub) {
        const ch = p.ch;
        return `<header class="hero"><p class="eyebrow">Chapter ${ch.id} · ${esc(ch.lecture)}</p><h2>${esc(p.title)}</h2>${sub ? `<p class="sub">${sub}</p>` : ''}</header>`;
    }
    function renderTopic(p) {
        const ch = p.ch, idx = ch.topics.indexOf(p.topic);
        const learned = !!S.load().learned[p.id];
        const dots = ch.topics.map((t, i) => {
            const id = `c${ch.id}-${t.id}`;
            const on = S.load().learned[id];
            return `<a href="#${id}" title="${esc(t.title)}" style="flex:1;height:6px;border-radius:99px;background:${i === idx ? 'var(--c)' : on ? 'color-mix(in srgb, var(--c) 55%, transparent)' : 'var(--line)'}"></a>`;
        }).join('');
        return chapterHero(p, `${esc(ch.title)}, topic ${idx + 1} of ${ch.topics.length}`) +
            `<div style="display:flex;gap:6px;margin:-8px 0 18px" aria-hidden="true">${dots}</div>
            <div class="topic-body">${p.topic.html}</div>
            <div class="learned-bar"><p>${learned ? '✓ You marked this topic as learned.' : 'Finished this topic? Mark it so your progress updates.'}</p>
            <button class="btn ${learned ? 'ghost' : 'primary'}" data-learned="${p.id}">${learned ? 'Mark as not learned' : '✓ Mark as learned'}</button></div>`;
    }
    function renderNotes(p) {
        const ch = p.ch;
        return chapterHero(p, `Everything from ${esc(ch.lecture)} on one page, for quick revision before a test.`) +
            `<div class="callout key"><span class="ttl">Learning outcomes</span><ol>${ch.outcomes.map(o => `<li>${esc(o)}</li>`).join('')}</ol></div>
            <div class="section">${ch.notes}</div>
            <div class="btn-row"><a class="btn primary" href="#c${ch.id}-subjective">Practise subjective questions →</a><a class="btn" href="#c${ch.id}-mcq">Take the MCQ prep →</a></div>`;
    }
    function renderSubjective(p) {
        const ch = p.ch, d = S.load();
        const items = ch.subjective.map((s, i) => {
            const key = `c${ch.id}-s${i}`;
            return `<div class="subj" id="${key}">
                <div class="subj-q"><span class="qn">Q${i + 1}</span><span class="qt">${esc(s.q)}</span><span class="mk">${s.m} marks</span></div>
                <textarea data-draft="${key}" placeholder="Draft your answer here, then compare with the model answer. Drafts are saved in this browser.">${esc(d.answers[key] || '')}</textarea>
                <div class="subj-actions"><button class="btn" data-model="${key}">Show model answer</button></div>
                <div class="ans" hidden>${s.a}</div></div>`;
        }).join('');
        return chapterHero(p, 'Write your own answer first, then reveal the model answer and check it point by point against the marks.') +
            `<div class="btn-row"><button class="btn" data-allmodels="show">Reveal all answers</button><button class="btn ghost" data-allmodels="hide">Hide all</button></div>${items}`;
    }
    function renderMcqPrep(p) {
        const ch = p.ch, q = S.load().quiz[`c${ch.id}`];
        const mistakes = BANK.filter(b => b.ch === ch.id && S.load().mistakes[b.id]).length;
        return chapterHero(p, `${ch.mcq.length} questions on ${esc(ch.title)}. Each answer is checked immediately, with an explanation.`) +
            `<div id="quiz-host"><div class="quiz-box">
            <div class="stat-row" style="margin-top:0">
              <div class="stat"><b>${ch.mcq.length}</b><span>Questions</span></div>
              <div class="stat"><b>${q ? q.best + '%' : '–'}</b><span>Best score</span></div>
              <div class="stat"><b>${q ? q.last + '%' : '–'}</b><span>Last attempt</span></div>
              <div class="stat"><b>${mistakes}</b><span>In mistake bank</span></div>
            </div>
            <div class="btn-row"><button class="btn primary" data-quiz="${ch.id}" data-mode="practice">Start practice (instant feedback)</button>
            <button class="btn" data-quiz="${ch.id}" data-mode="exam">Exam mode (feedback at end)</button>
            ${mistakes ? `<button class="btn" data-quiz="${ch.id}" data-mode="mistakes">Retry my ${mistakes} mistake${mistakes > 1 ? 's' : ''}</button>` : ''}</div>
            <p class="small muted">Tip: press keys 1–4 to choose an option and Enter to continue.</p></div></div>`;
    }

    /* ---------- Global pages ---------- */
    const GLOBAL_RENDER = {
        home() {
            const o = overall(), d = S.load();
            const quizzes = Object.values(d.quiz);
            const avg = quizzes.length ? Math.round(quizzes.reduce((a, q) => a + q.best, 0) / quizzes.length) : null;
            const mistakes = Object.keys(d.mistakes).length;
            const last = S.pref('last');
            const lastP = last && last !== 'home' ? pageById(last) : null;
            const cards = ML.chapters.map(ch => {
                const pr = chapterProgress(ch);
                return `<div class="ch-card" data-nav="c${ch.id}-${ch.topics[0].id}" style="--cc:${ch.color}" role="link" tabindex="0">
                    <div class="n">CHAPTER ${ch.id} · ${esc(ch.lecture.toUpperCase())}</div><h4>${esc(ch.title)}</h4><p>${esc(ch.blurb)}</p>
                    <div class="meter"><i style="width:${pr.pct}%"></i></div>
                    <div class="stats"><span>${pr.done}/${pr.total} topics</span><span>${pr.best != null ? 'MCQ best ' + pr.best + '%' : 'MCQ not taken'}</span></div></div>`;
            }).join('');
            return `<header class="hero"><p class="eyebrow">TEB3123 Machine Learning</p><h2>Guided learning &amp; exam prep</h2>
                <p class="sub">Eight chapters built from your lecture slides: guided lessons with interactive visuals, full revision notes, subjective model answers, worked calculations and an MCQ simulator. Your progress is saved in this browser.</p>
                <div class="btn-row">${lastP ? `<a class="btn primary" href="#${lastP.id}">Continue: ${esc(lastP.ch ? 'Ch ' + lastP.ch.id + ' · ' : '')}${esc(lastP.title)} →</a>` : `<a class="btn primary" href="#c1-what">Start with Chapter 1 →</a>`}
                <a class="btn" href="#simulator">Open MCQ simulator</a><a class="btn" href="#formulas">Formula sheet</a></div></header>
                <div class="stat-row">
                  <div class="stat"><b>${o.done}/${o.total}</b><span>Topics learned</span></div>
                  <div class="stat"><b>${o.pct}%</b><span>Course progress</span></div>
                  <div class="stat"><b>${avg != null ? avg + '%' : '–'}</b><span>Average best MCQ score</span></div>
                  <div class="stat"><b>${mistakes}</b><span>Questions in mistake bank</span></div>
                  <div class="stat"><b>${BANK.length}</b><span>MCQs available</span></div>
                </div>
                <h3>Chapters</h3><div class="ch-grid">${cards}</div>
                <h3>How to use this hub</h3>
                <ol class="steps">
                  <li><strong>Learn</strong>: work through each chapter's topics. Open the <em>Check yourself</em> questions and try the interactive visuals. Press <em>Mark as learned</em> when you finish a topic.</li>
                  <li><strong>Consolidate</strong>: read the chapter's <em>Full revision notes</em>, then draft answers in <em>Subjective exam prep</em> before revealing the model answers.</li>
                  <li><strong>Test</strong>: take the chapter <em>MCQ prep</em>. Wrong answers go into your mistake bank automatically.</li>
                  <li><strong>Exam week</strong>: use the <em>Cheat Sheet</em>, the <em>Formula Sheet</em> in recall mode, <em>Common Confusions</em> and <em>Worked Calculations</em>, then run the <em>MCQ Simulator</em> across all chapters and retry your mistakes.</li>
                </ol>
                <div class="callout note"><span class="ttl">About accuracy</span>The content follows your lecture slides. Where a slide contains an arithmetic slip or inconsistent wording (the Gini split, the Naïve Bayes posterior, the scaler table, the padding example), the lesson flags it and shows the corrected working.</div>`;
        },
        cheat() {
            return `<header class="hero"><p class="eyebrow">Exam prep</p><h2>Master Cheat Sheet</h2><p class="sub">Every chapter in a few lines each. Print it, or skim it the night before.</p></header>` +
                ML.chapters.map(ch => `<div class="section" style="border-left:5px solid ${ch.color}"><h3 style="color:${ch.color}">Ch ${ch.id} · ${esc(ch.title)}</h3>${ML.global.cheat[ch.id] || ''}
                <div class="btn-row" style="margin-bottom:0"><a class="btn" href="#c${ch.id}-notes">Full notes</a><a class="btn" href="#c${ch.id}-mcq">MCQ prep</a></div></div>`).join('');
        },
        formulas() {
            const chips = `<button class="chip on" data-ff-chip="all">All</button>` + ML.chapters.filter(ch => ML.global.formulas.some(f => f.ch === ch.id)).map(ch => `<button class="chip" data-ff-chip="${ch.id}">Ch ${ch.id}</button>`).join('');
            const cards = ML.global.formulas.map(f => {
                const ch = ML.chapter(f.ch);
                const text = (f.n + ' ' + f.w + ' ' + ch.title).toLowerCase();
                return `<div class="ff-card" data-ff-ch="${f.ch}" data-ff-text="${esc(text)}" style="--cc:${ch.color}"><span class="ch">Ch ${f.ch} · ${esc(ch.short)}</span><h5>${esc(f.n)}</h5><div class="fx" data-fx>$$${f.tex}$$</div><p class="why">${esc(f.w)}</p></div>`;
            }).join('');
            return `<header class="hero"><p class="eyebrow">Exam prep</p><h2>Formula Sheet</h2><p class="sub">Every formula from the course. Turn on <strong>Recall mode</strong> to blur the formulas and test yourself: click one to reveal it.</p></header>
                <input class="search" id="ff-search" type="search" placeholder="Search formulas (e.g. lift, softmax, gini)…" aria-label="Search formulas">
                <div class="chips" id="ff-chips">${chips}</div>
                <div class="btn-row"><button class="btn" id="ff-recall" aria-pressed="false">Recall mode: off</button></div>
                <div class="ff-grid" id="ff-grid">${cards}</div><p class="muted" id="ff-empty" hidden>No formulas match.</p>`;
        },
        traps() {
            const chips = `<button class="chip on" data-trap-chip="all">All</button>` + ML.chapters.map(ch => `<button class="chip" data-trap-chip="${ch.id}">Ch ${ch.id}</button>`).join('');
            const cards = ML.global.traps.map(t => {
                const ch = ML.chapter(t.ch);
                return `<div class="trap-card" data-trap-ch="${t.ch}" style="border-left:5px solid ${ch.color}"><h5>${esc(t.t)} <span class="small muted">· Ch ${t.ch}</span></h5>
                <div class="vs"><div><h5>${esc(t.a[0])}</h5><p>${esc(t.a[1])}</p></div><div><h5>${esc(t.b[0])}</h5><p>${esc(t.b[1])}</p></div></div>
                <p class="small" style="margin:0"><strong style="color:var(--bad)">Rule:</strong> ${esc(t.r)}</p></div>`;
            }).join('');
            return `<header class="hero"><p class="eyebrow">Exam prep</p><h2>Common Confusions</h2><p class="sub">Pairs of concepts that examiners love to swap. If you can explain the difference in each card, you'll avoid most MCQ traps.</p></header>
                <div class="chips">${chips}</div><div id="trap-list">${cards}</div>`;
        },
        calc() {
            const chips = `<button class="chip on" data-calc-chip="all">All</button>` + [...new Set(ML.global.calcs.map(c => c.ch))].map(n => `<button class="chip" data-calc-chip="${n}">Ch ${n}</button>`).join('');
            const cards = ML.global.calcs.map((c, i) => {
                const ch = ML.chapter(c.ch);
                return `<div class="section calc" data-calc-ch="${c.ch}" style="border-left:5px solid ${ch.color}">
                <p class="eyebrow" style="color:${ch.color}">Ch ${c.ch} · ${esc(ch.short)}</p><h4 style="margin-top:0">${esc(c.t)}</h4><p><strong>${c.p}</strong></p>
                <ol class="steps">${c.s.map(s => `<li class="calc-step">${s}</li>`).join('')}</ol>
                <div class="callout tip calc-step calc-ans"><span class="ttl">Answer</span>${c.a}</div>
                <div class="btn-row" style="margin-bottom:0"><button class="btn primary" data-step="${i}">Show next step</button><button class="btn" data-stepall="${i}">Show full solution</button><button class="btn ghost" data-stepreset="${i}">Reset</button></div></div>`;
            }).join('');
            return `<header class="hero"><p class="eyebrow">Exam prep</p><h2>Worked Calculations</h2><p class="sub">Every calculation type that can appear in a test, solved step by step. Try each one on paper first, then reveal one step at a time.</p></header>
                <div class="chips">${chips}</div><div id="calc-list">${cards}</div>`;
        },
        simulator() {
            const chips = ML.chapters.map(ch => `<button class="chip on" data-sim-ch="${ch.id}" style="--c:${ch.color}">Ch ${ch.id} · ${esc(ch.short)}</button>`).join('');
            const mistakes = Object.keys(S.load().mistakes).length;
            return `<header class="hero"><p class="eyebrow">Exam prep</p><h2>MCQ Simulator</h2><p class="sub">Random questions drawn from all ${BANK.length} MCQs. Choose your chapters and mode. Exam mode holds all feedback until you finish.</p></header>
                <div id="quiz-host"><div class="quiz-box">
                <h4 style="margin-top:0">Chapters</h4><div class="chips" id="sim-chips">${chips}</div>
                <div class="btn-row" style="margin-top:4px"><button class="btn ghost" data-sim-all="1">Select all</button><button class="btn ghost" data-sim-all="0">Clear</button></div>
                <div class="setup-grid">
                  <label class="field">Number of questions<select class="txt" id="sim-n"><option value="10">10</option><option value="20" selected>20</option><option value="30">30</option><option value="50">50</option><option value="999">All available</option></select></label>
                  <label class="field">Mode<select class="txt" id="sim-mode"><option value="exam">Exam (feedback at end)</option><option value="practice">Practice (instant feedback)</option></select></label>
                  <label class="field">Timer<select class="txt" id="sim-timer"><option value="0">No timer</option><option value="60">1 min per question</option><option value="45">45 s per question</option></select></label>
                </div>
                <p class="small muted" id="sim-avail"></p>
                <div class="btn-row"><button class="btn primary" id="sim-start">Start simulator</button>${mistakes ? `<button class="btn" data-quiz="all" data-mode="mistakes">Retry all ${mistakes} mistake${mistakes > 1 ? 's' : ''}</button>` : ''}</div>
                </div></div>`;
        },
        strategy() {
            return `<header class="hero"><p class="eyebrow">Exam prep</p><h2>Test Strategy</h2><p class="sub">How to turn what you know into marks.</p></header>${ML.global.strategy}`;
        }
    };

    /* ---------- Formula sheet filtering ---------- */
    function ffApply() {
        const grid = $('#ff-grid'); if (!grid) return;
        const chip = $('#ff-chips .chip.on'), ch = chip ? chip.dataset.ffChip : 'all';
        const q = ($('#ff-search').value || '').trim().toLowerCase();
        let shown = 0;
        $$('.ff-card', grid).forEach(c => {
            const hit = (ch === 'all' || c.dataset.ffCh === ch) && (!q || c.dataset.ffText.includes(q));
            c.hidden = !hit; if (hit) shown++;
        });
        $('#ff-empty').hidden = shown > 0;
    }

    /* ---------- Quiz engine ---------- */
    let Q = null, timerId = null;
    function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
    function makeQ(b) {
        const opts = shuffle(b.o.map((t, i) => ({ t, ok: i === b.a })));
        return { b, opts };
    }
    function startQuiz(pool, opts) {
        if (!pool.length) {
            const host = $('#quiz-host');
            if (host && !$('.quiz-empty', host)) host.insertAdjacentHTML('afterbegin', '<p class="callout trap quiz-empty">No questions match that selection. Choose at least one chapter.</p>');
            return;
        }
        Q = Object.assign({ qs: pool.map(makeQ), i: 0, picks: [], checked: [], mode: 'practice', key: null, timer: 0, left: 0, title: 'Quiz' }, opts);
        Q.picks = new Array(Q.qs.length).fill(null);
        Q.checked = new Array(Q.qs.length).fill(false);
        if (Q.timer) { Q.left = Q.timer * Q.qs.length; startTimer(); }
        drawQuestion();
    }
    function startTimer() {
        stopTimer();
        timerId = setInterval(() => {
            if (!Q) return stopTimer();
            Q.left--;
            const t = $('#q-timer'); if (t) t.textContent = fmtTime(Q.left);
            if (Q.left <= 0) { stopTimer(); finishQuiz(true); }
        }, 1000);
    }
    function stopTimer() { if (timerId) clearInterval(timerId); timerId = null; }
    const fmtTime = s => `${Math.floor(Math.max(0, s) / 60)}:${String(Math.max(0, s) % 60).padStart(2, '0')}`;

    function drawQuestion() {
        const host = $('#quiz-host'); if (!host || !Q) return;
        const item = Q.qs[Q.i], pick = Q.picks[Q.i], checked = Q.checked[Q.i];
        const ch = ML.chapter(item.b.ch);
        const L = 'ABCD';
        const opts = item.opts.map((o, k) => {
            let cls = '';
            if (checked) { if (o.ok) cls = 'right'; else if (pick === k) cls = 'wrong'; }
            else if (pick === k) cls = 'sel';
            return `<button class="opt ${cls}" data-option="${k}" ${checked ? 'disabled' : ''}><span class="L">${L[k]}</span><span>${esc(o.t)}</span></button>`;
        }).join('');
        let feedback = '';
        if (checked) {
            const ok = item.opts[pick] && item.opts[pick].ok;
            feedback = `<div class="explain"><p><span class="verdict ${ok ? 'ok' : 'no'}">${ok ? '✓ Correct.' : '✗ Not quite.'}</span> ${ok ? '' : 'Answer: <strong>' + esc(item.opts.find(o => o.ok).t) + '</strong>.'}</p><p>${esc(item.b.e)}</p></div>`;
        }
        const last = Q.i === Q.qs.length - 1;
        let actions;
        if (Q.mode === 'exam') {
            actions = `<button class="btn" data-qnav="-1" ${Q.i === 0 ? 'disabled' : ''}>← Back</button>
                <button class="btn primary" data-qnav="1">${last ? 'Finish & see results' : 'Next →'}</button>`;
        } else {
            actions = checked
                ? `<button class="btn primary" data-qnav="1">${last ? 'See results' : 'Next question →'}</button>`
                : `<button class="btn primary" data-qcheck="1" ${pick == null ? 'disabled' : ''}>Check answer</button>`;
        }
        const answered = Q.picks.filter(x => x != null).length;
        host.innerHTML = `<div class="quiz-box" style="--c:${ch.color}">
            <div class="quiz-top"><span>${esc(Q.title)} · Question ${Q.i + 1} of ${Q.qs.length}</span>
            <span>${Q.timer ? `⏱ <span id="q-timer">${fmtTime(Q.left)}</span> · ` : ''}Ch ${ch.id} · ${esc(ch.short)}</span></div>
            <div class="quiz-prog"><i style="width:${(Q.mode === 'exam' ? answered : Q.i) / Q.qs.length * 100}%"></i></div>
            <div class="q-text">${esc(item.b.q)}</div><div class="opts">${opts}</div>${feedback}
            <div class="btn-row" style="justify-content:space-between"><div class="btn-row" style="margin:0">${actions}</div>
            <button class="btn ghost" data-qquit="1">Quit</button></div></div>`;
        if (typeof renderMathInElement === 'function') afterRender(host);
    }
    function selectOption(k) {
        if (!Q || Q.checked[Q.i]) return;
        Q.picks[Q.i] = k;
        drawQuestion();
    }
    function checkAnswer() {
        if (!Q || Q.picks[Q.i] == null) return;
        Q.checked[Q.i] = true;
        recordAnswer(Q.qs[Q.i], Q.picks[Q.i]);
        drawQuestion();
    }
    function recordAnswer(item, pick) {
        const d = S.load();
        if (item.opts[pick] && item.opts[pick].ok) delete d.mistakes[item.b.id];
        else d.mistakes[item.b.id] = 1;
        S.save();
    }
    function qnav(dir, btn) {
        if (!Q) return;
        if (dir > 0 && Q.i === Q.qs.length - 1) {
            const unanswered = Q.mode === 'exam' ? Q.picks.filter(p => p == null).length : 0;
            if (unanswered && btn && !confirmTap(btn, `${unanswered} unanswered. Tap again to finish`)) return;
            return finishQuiz(false);
        }
        Q.i = Math.max(0, Math.min(Q.qs.length - 1, Q.i + dir));
        drawQuestion();
        const host = $('#quiz-host'); if (host) host.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
    function finishQuiz(timeUp) {
        stopTimer();
        if (!Q) return;
        if (Q.mode === 'exam') {
            Q.qs.forEach((item, i) => { if (Q.picks[i] != null) recordAnswer(item, Q.picks[i]); else S.load().mistakes[item.b.id] = 1; });
            S.save();
        }
        const results = Q.qs.map((item, i) => ({ item, pick: Q.picks[i], ok: Q.picks[i] != null && item.opts[Q.picks[i]].ok }));
        const correct = results.filter(r => r.ok).length;
        const pct = Math.round(correct / results.length * 100);
        if (Q.key) {
            const d = S.load(), prev = d.quiz[Q.key];
            d.quiz[Q.key] = { best: Math.max(pct, prev ? prev.best : 0), last: pct, attempts: (prev ? prev.attempts : 0) + 1 };
            S.save();
            buildNav(); syncNav(current);
        }
        const byCh = {};
        results.forEach(r => { const c = r.item.b.ch; byCh[c] = byCh[c] || [0, 0]; byCh[c][1]++; if (r.ok) byCh[c][0]++; });
        const breakdown = Object.keys(byCh).length > 1 ? `<div class="tbl-wrap"><table class="tbl"><tr><th>Chapter</th><th class="num">Score</th></tr>${Object.entries(byCh).map(([c, [a, n]]) => `<tr><td>Ch ${c} · ${esc(ML.chapter(c).short)}</td><td class="num">${a}/${n} (${Math.round(a / n * 100)}%)</td></tr>`).join('')}</table></div>` : '';
        const review = results.map((r, i) => {
            const right = r.item.opts.find(o => o.ok).t;
            const yours = r.pick != null ? r.item.opts[r.pick].t : '(no answer)';
            return `<div class="review-item ${r.ok ? 'ok' : 'no'}"><p style="margin:0 0 6px"><strong>Q${i + 1}.</strong> ${esc(r.item.b.q)}</p>
                ${r.ok ? `<p class="small" style="margin:0"><span class="verdict ok">✓</span> ${esc(right)}</p>` : `<p class="small" style="margin:0"><span class="verdict no">✗ Your answer:</span> ${esc(yours)}<br><span class="verdict ok">✓ Correct:</span> ${esc(right)}</p>`}
                <p class="small muted" style="margin:6px 0 0">${esc(r.item.b.e)}</p></div>`;
        }).join('');
        const wrongIds = results.filter(r => !r.ok).map(r => r.item.b.id);
        const msg = pct >= 85 ? 'Excellent. You are exam-ready on this material.' : pct >= 65 ? 'Solid. Review the misses below and retry them.' : 'Keep going. Revisit the lessons for the chapters you missed, then retry.';
        const host = $('#quiz-host');
        host.innerHTML = `<div class="quiz-box"><p class="eyebrow">${timeUp ? 'Time is up · ' : ''}${esc(Q.title)} results</p>
            <div style="display:flex;gap:20px;align-items:center;flex-wrap:wrap"><div class="score-big">${pct}%</div><div><p style="margin:0;font-weight:700;color:var(--ink)">${correct} of ${results.length} correct</p><p class="muted" style="margin:2px 0 0">${msg}</p></div></div>
            ${breakdown}
            <div class="btn-row">${wrongIds.length ? `<button class="btn primary" data-retry="${wrongIds.join(',')}">Retry the ${wrongIds.length} I missed</button>` : ''}
            <button class="btn" data-qrestart="1">Start again</button></div>
            <h4>Review</h4>${review}</div>`;
        Q.lastWrong = wrongIds;
        host.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }

    function launchQuiz(which, mode) {
        const d = S.load();
        if (mode === 'mistakes') {
            const pool = BANK.filter(b => d.mistakes[b.id] && (which === 'all' || b.ch === Number(which)));
            return startQuiz(shuffle(pool), { mode: 'practice', title: 'Mistake review' });
        }
        const ch = ML.chapter(which);
        startQuiz(shuffle(BANK.filter(b => b.ch === ch.id)), { mode, key: `c${ch.id}`, title: `Ch ${ch.id} MCQ prep` });
    }
    function simSetupInit() {
        const upd = () => {
            const chs = $$('#sim-chips .chip.on').map(c => Number(c.dataset.simCh));
            const n = BANK.filter(b => chs.includes(b.ch)).length;
            const el = $('#sim-avail'); if (el) el.textContent = `${n} questions available from ${chs.length} chapter${chs.length === 1 ? '' : 's'}.`;
        };
        upd(); simSetupInit.upd = upd;
    }
    function simStart() {
        const chs = $$('#sim-chips .chip.on').map(c => Number(c.dataset.simCh));
        const n = Number($('#sim-n').value), mode = $('#sim-mode').value, timer = Number($('#sim-timer').value);
        const pool = shuffle(BANK.filter(b => chs.includes(b.ch))).slice(0, n);
        startQuiz(pool, { mode, timer, title: 'Simulator' });
    }

    /* ---------- Sidebar ---------- */
    function toggleSidebar(force) {
        const sb = $('#sidebar'), open = force != null ? force : !sb.classList.contains('open');
        sb.classList.toggle('open', open);
        $('#scrim').hidden = !open;
        $('#mobile-menu').setAttribute('aria-expanded', String(open));
    }
    function closeSidebar() { if ($('#sidebar').classList.contains('open')) toggleSidebar(false); }

    /* ---------- Events ---------- */
    document.addEventListener('click', e => {
        const t = e.target.closest('button, [data-nav], .fx, a');
        if (!t) return;
        const d = t.dataset;
        if (d.nav) { e.preventDefault(); navTo(d.nav); return; }
        if (d.action) {
            if (d.action === 'toggle-sidebar') toggleSidebar();
            else if (d.action === 'close-sidebar') toggleSidebar(false);
            else if (d.action === 'print') window.print();
            else if (d.action === 'theme') toggleTheme();
            else if (d.action === 'reset-progress') {
                if (confirmTap(t, 'Tap again to erase all progress')) { S.reset(); buildNav(); render(current); }
            }
            return;
        }
        if (d.learned) {
            const st = S.load(); if (st.learned[d.learned]) delete st.learned[d.learned]; else st.learned[d.learned] = 1; S.save();
            const wasLearned = !!st.learned[d.learned];
            buildNav(); render(current, true);
            if (wasLearned) { const nx = PAGES[PAGES.indexOf(pageById(current)) + 1]; if (nx) { const bar = $('.learned-bar p'); if (bar) bar.innerHTML = `✓ Marked as learned. Next up: <a href="#${nx.id}">${esc(nx.title)}</a>`; } }
            return;
        }
        if (d.model) {
            const box = document.getElementById(d.model).querySelector('.ans');
            box.hidden = !box.hidden; t.textContent = box.hidden ? 'Show model answer' : 'Hide model answer'; return;
        }
        if (d.allmodels) {
            const show = d.allmodels === 'show';
            $$('.subj').forEach(s => { s.querySelector('.ans').hidden = !show; s.querySelector('[data-model]').textContent = show ? 'Hide model answer' : 'Show model answer'; });
            return;
        }
        if (d.quiz) { launchQuiz(d.quiz, d.mode); return; }
        if (d.option != null && d.option !== '') { selectOption(Number(d.option)); return; }
        if (d.qcheck) { checkAnswer(); return; }
        if (d.qnav) { qnav(Number(d.qnav), t); return; }
        if (d.qquit) { if (confirmTap(t, 'Tap again to quit')) { stopTimer(); Q = null; render(current); } return; }
        if (d.qrestart) { Q = null; render(current); return; }
        if (d.retry) {
            const ids = d.retry.split(',');
            startQuiz(shuffle(BANK.filter(b => ids.includes(b.id))), { mode: 'practice', title: 'Retry missed' });
            return;
        }
        if (d.simCh) { t.classList.toggle('on'); simSetupInit.upd && simSetupInit.upd(); return; }
        if (d.simAll != null) { $$('#sim-chips .chip').forEach(c => c.classList.toggle('on', d.simAll === '1')); simSetupInit.upd && simSetupInit.upd(); return; }
        if (t.id === 'sim-start') { simStart(); return; }
        if (d.ffChip) { $$('#ff-chips .chip').forEach(c => c.classList.toggle('on', c === t)); ffApply(); return; }
        if (t.id === 'ff-recall') {
            const g = $('#ff-grid'), on = g.classList.toggle('recall');
            t.textContent = 'Recall mode: ' + (on ? 'on' : 'off'); t.setAttribute('aria-pressed', String(on));
            $$('.fx', g).forEach(f => f.classList.remove('show')); return;
        }
        if (t.classList.contains('fx') && t.closest('.recall')) { t.classList.toggle('show'); return; }
        if (d.trapChip) {
            $$('[data-trap-chip]').forEach(c => c.classList.toggle('on', c === t));
            $$('#trap-list .trap-card').forEach(c => { c.hidden = !(d.trapChip === 'all' || c.dataset.trapCh === d.trapChip); });
            return;
        }
        if (d.calcChip) {
            $$('[data-calc-chip]').forEach(c => c.classList.toggle('on', c === t));
            $$('#calc-list .calc').forEach(c => { c.hidden = !(d.calcChip === 'all' || c.dataset.calcCh === d.calcChip); });
            return;
        }
        if (d.step != null && d.step !== '') {
            const card = t.closest('.calc'), next = card.querySelector('.calc-step:not(.show)');
            if (next) next.classList.add('show');
            if (!card.querySelector('.calc-step:not(.show)')) t.disabled = true;
            return;
        }
        if (d.stepall != null && d.stepall !== '') { const card = t.closest('.calc'); $$('.calc-step', card).forEach(s => s.classList.add('show')); card.querySelector('[data-step]').disabled = true; return; }
        if (d.stepreset != null && d.stepreset !== '') { const card = t.closest('.calc'); $$('.calc-step', card).forEach(s => s.classList.remove('show')); card.querySelector('[data-step]').disabled = false; return; }
    });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeSidebar();
        const card = e.target.closest && e.target.closest('.ch-card');
        if (card && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); navTo(card.dataset.nav); return; }
        if (!Q || !$('#quiz-host .opts')) return;
        if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
        const map = { '1': 0, '2': 1, '3': 2, '4': 3, a: 0, b: 1, c: 2, d: 3 };
        const k = map[e.key.toLowerCase()];
        if (k != null && k < Q.qs[Q.i].opts.length) { selectOption(k); e.preventDefault(); }
        else if (e.key === 'Enter') {
            e.preventDefault();
            if (Q.mode === 'exam') qnav(1);
            else if (!Q.checked[Q.i]) checkAnswer(); else qnav(1);
        }
    });
    let draftTimer;
    document.addEventListener('input', e => {
        if (e.target.id === 'ff-search') ffApply();
        if (e.target.dataset && e.target.dataset.draft) {
            clearTimeout(draftTimer);
            const key = e.target.dataset.draft, val = e.target.value;
            draftTimer = setTimeout(() => { S.load().answers[key] = val; S.save(); }, 400);
        }
    });

    /* ---------- Boot ---------- */
    let framed = false; try { framed = window.self !== window.top; } catch (e) { framed = true; }
    if (framed) { const pb = $('[data-action="print"]'); if (pb) pb.hidden = true; }
    buildNav();
    render(location.hash.slice(1) || 'home');
})();
