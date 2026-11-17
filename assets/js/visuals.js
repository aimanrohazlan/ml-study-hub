/* Interactive visuals. Each ML.vis[name](el) builds a widget inside a .vis container. */
(function () {
    'use strict';
    const V = ML.vis;
    const PAL = ['#2563eb', '#dc2626', '#059669', '#d97706', '#7c3aed', '#db2777', '#0891b2', '#65a30d'];
    const css = n => getComputedStyle(document.documentElement).getPropertyValue('--' + n).trim();
    const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const fx = (v, d = 3) => (Math.round(v * 10 ** d) / 10 ** d).toString();

    function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
    function gauss(r) { let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }

    /* ---- UI helpers ---- */
    function head(el, title, sub) { el.innerHTML = `<p class="vis-title">${title}</p>${sub ? `<p class="vis-sub">${sub}</p>` : ''}`; }
    function ctrls(el) { const d = document.createElement('div'); d.className = 'ctrls'; el.appendChild(d); return d; }
    function slider(p, label, min, max, step, val, fn, fmt) {
        const l = document.createElement('label');
        l.innerHTML = `<span>${label}</span>`;
        const i = document.createElement('input'); Object.assign(i, { type: 'range', min, max, step, value: val });
        const o = document.createElement('output'); o.style.minWidth = '42px'; o.style.fontFamily = 'JetBrains Mono, monospace';
        const upd = () => { o.textContent = fmt ? fmt(+i.value) : i.value; };
        i.addEventListener('input', () => { upd(); fn(+i.value); });
        upd(); l.append(i, o); p.appendChild(l); return i;
    }
    function button(p, label, fn, primary) { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn' + (primary ? ' primary' : ''); b.textContent = label; b.addEventListener('click', fn); p.appendChild(b); return b; }
    function select(p, label, opts, val, fn) {
        const l = document.createElement('label'); l.innerHTML = `<span>${label}</span>`;
        const s = document.createElement('select'); s.className = 'txt';
        opts.forEach(([v, t]) => { const o = document.createElement('option'); o.value = v; o.textContent = t; s.appendChild(o); });
        s.value = val; s.addEventListener('change', () => fn(s.value)); l.appendChild(s); p.appendChild(l); return s;
    }
    function numIn(p, label, val, fn, step = 'any', w = 72) {
        const l = document.createElement('label'); l.innerHTML = `<span>${label}</span>`;
        const i = document.createElement('input'); i.type = 'number'; i.className = 'txt'; i.step = step; i.value = val; i.style.width = w + 'px';
        i.addEventListener('input', () => fn(parseFloat(i.value))); l.appendChild(i); p.appendChild(l); return i;
    }
    function readout(el) { const d = document.createElement('div'); d.className = 'readout'; el.appendChild(d); return d; }
    function box(el, html) { const d = document.createElement('div'); d.innerHTML = html || ''; el.appendChild(d); return d; }
    function canvas(el, w, h) {
        const c = document.createElement('canvas');
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        c.width = w * dpr; c.height = h * dpr; c.style.aspectRatio = `${w} / ${h}`;
        const ctx = c.getContext('2d'); ctx.scale(dpr, dpr);
        el.appendChild(c);
        return {
            c, ctx, w, h,
            pos(e) { const r = c.getBoundingClientRect(); return { x: (e.clientX - r.left) * w / r.width, y: (e.clientY - r.top) * h / r.height }; },
            clear() { ctx.clearRect(0, 0, w, h); }
        };
    }
    /* axes mapping: returns {X,Y,inv} and draws grid */
    function axes(cv, xr, yr, o = {}) {
        const { ctx, w, h } = cv, m = Object.assign({ l: 40, r: 14, t: 14, b: 28 }, o.m || {});
        const X = x => m.l + (x - xr[0]) / (xr[1] - xr[0]) * (w - m.l - m.r);
        const Y = y => h - m.b - (y - yr[0]) / (yr[1] - yr[0]) * (h - m.t - m.b);
        const ix = px => xr[0] + (px - m.l) / (w - m.l - m.r) * (xr[1] - xr[0]);
        const iy = py => yr[0] + (h - m.b - py) / (h - m.t - m.b) * (yr[1] - yr[0]);
        if (o.grid !== false) {
            ctx.strokeStyle = css('line'); ctx.lineWidth = 1; ctx.fillStyle = css('muted'); ctx.font = '11px Inter, sans-serif';
            const xs = o.xt || ticks(xr), ys = o.yt || ticks(yr);
            xs.forEach(v => { ctx.beginPath(); ctx.moveTo(X(v), m.t); ctx.lineTo(X(v), h - m.b); ctx.stroke(); ctx.textAlign = 'center'; ctx.fillText(fmtT(v), X(v), h - m.b + 16); });
            ys.forEach(v => { ctx.beginPath(); ctx.moveTo(m.l, Y(v)); ctx.lineTo(w - m.r, Y(v)); ctx.stroke(); ctx.textAlign = 'right'; ctx.fillText(fmtT(v), m.l - 6, Y(v) + 4); });
            if (o.xl) { ctx.textAlign = 'right'; ctx.fillText(o.xl, w - m.r, h - m.b - 6); }
            if (o.yl) { ctx.textAlign = 'left'; ctx.fillText(o.yl, m.l + 6, m.t + 10); }
        }
        return { X, Y, ix, iy, m };
    }
    function ticks([a, b]) { const span = b - a, step = Math.pow(10, Math.floor(Math.log10(span / 4))); const n = span / step; const s = n > 20 ? step * 5 : n > 8 ? step * 2 : step; const out = []; for (let v = Math.ceil(a / s) * s; v <= b + 1e-9; v += s) out.push(+v.toFixed(10)); return out; }
    const fmtT = v => Math.abs(v) >= 1000 ? (v / 1000) + 'k' : (+v.toFixed(2)).toString();
    function dot(ctx, x, y, r, fill, stroke) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); } }
    function line(ctx, x1, y1, x2, y2, col, w = 2, dash) { ctx.beginPath(); ctx.setLineDash(dash || []); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke(); ctx.setLineDash([]); }
    function text(ctx, s, x, y, col, align = 'left', size = 12, weight = 600) { ctx.fillStyle = col; ctx.textAlign = align; ctx.font = `${weight} ${size}px Inter, sans-serif`; ctx.fillText(s, x, y); }
    function solve(A, b) {
        const n = b.length; A = A.map((r, i) => r.concat([b[i]]));
        for (let c = 0; c < n; c++) {
            let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
            [A[c], A[p]] = [A[p], A[c]];
            if (Math.abs(A[c][c]) < 1e-12) continue;
            for (let r = 0; r < n; r++) if (r !== c) { const f = A[r][c] / A[c][c]; for (let k = c; k <= n; k++) A[r][k] -= f * A[c][k]; }
        }
        return A.map((r, i) => Math.abs(r[i]) < 1e-12 ? 0 : r[n] / r[i]);
    }
    function polyfit(xs, ys, deg, lam = 1e-7) {
        const n = deg + 1, A = Array.from({ length: n }, () => new Array(n).fill(0)), b = new Array(n).fill(0);
        xs.forEach((x, i) => { const p = []; for (let j = 0; j < n; j++) p.push(x ** j); for (let j = 0; j < n; j++) { b[j] += p[j] * ys[i]; for (let k = 0; k < n; k++) A[j][k] += p[j] * p[k]; } });
        for (let j = 0; j < n; j++) A[j][j] += lam;
        return solve(A, b);
    }
    const peval = (c, x) => c.reduce((s, v, j) => s + v * x ** j, 0);
    function matHTML(M, cls = () => '', cols) {
        const n = cols || M[0].length;
        return `<div class="grid-mat" style="grid-template-columns:repeat(${n},auto)">${M.flat().map((v, k) => `<span class="${cls(Math.floor(k / n), k % n)}">${v}</span>`).join('')}</div>`;
    }

    /* =============== Chapter 1: over/underfitting =============== */
    V.fit = el => {
        head(el, 'Overfitting vs underfitting', 'Move the polynomial degree. Blue dots are training data and orange rings are unseen test data. Watch the training and test error move apart.');
        const cv = canvas(el, 640, 300), r = rng(7);
        const f = x => Math.sin(Math.PI * x) * 0.8 + 0.3 * x;
        const tr = Array.from({ length: 14 }, (_, i) => { const x = -0.95 + 1.9 * i / 13 + (r() - .5) * .08; return [x, f(x) + gauss(r) * .18]; });
        const te = Array.from({ length: 30 }, () => { const x = -0.98 + 1.96 * r(); return [x, f(x) + gauss(r) * .18]; });
        const out = readout(el); let deg = 1;
        const c = ctrls(el); slider(c, 'Degree', 1, 13, 1, deg, v => { deg = v; draw(); });
        function mse(co, pts) { return pts.reduce((s, [x, y]) => s + (peval(co, x) - y) ** 2, 0) / pts.length; }
        function draw() {
            cv.clear(); const A = axes(cv, [-1, 1], [-1.6, 1.6], { xl: 'x', yl: 'y' });
            const co = polyfit(tr.map(p => p[0]), tr.map(p => p[1]), deg);
            const ctx = cv.ctx; ctx.beginPath(); ctx.setLineDash([4, 4]);
            for (let i = 0; i <= 200; i++) { const x = -1 + 2 * i / 200; i ? ctx.lineTo(A.X(x), A.Y(f(x))) : ctx.moveTo(A.X(x), A.Y(f(x))); }
            ctx.strokeStyle = css('muted'); ctx.lineWidth = 1.5; ctx.stroke(); ctx.setLineDash([]);
            ctx.save(); ctx.beginPath(); ctx.rect(A.m.l, A.m.t, cv.w - A.m.l - A.m.r, cv.h - A.m.t - A.m.b); ctx.clip();
            ctx.beginPath(); for (let i = 0; i <= 300; i++) { const x = -1 + 2 * i / 300; const y = peval(co, x); i ? ctx.lineTo(A.X(x), A.Y(y)) : ctx.moveTo(A.X(x), A.Y(y)); }
            ctx.strokeStyle = css('c') || '#0284c7'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
            te.forEach(([x, y]) => dot(ctx, A.X(x), A.Y(y), 4.5, null, '#d97706'));
            tr.forEach(([x, y]) => dot(ctx, A.X(x), A.Y(y), 5, '#2563eb'));
            const a = mse(co, tr), b = mse(co, te);
            const verdict = deg <= 2 ? 'UNDERFITTING: too simple, high error on both sets' : deg <= 6 ? 'GOOD FIT: low training and test error' : 'OVERFITTING: training error tiny, test error grows';
            out.textContent = `degree ${deg}   train MSE = ${fx(a)}   test MSE = ${fx(b)}\n${verdict}`;
        }
        draw();
    };

    /* =============== Chapter 2: mean vs median imputation =============== */
    V.impute = el => {
        head(el, 'Mean vs median imputation', 'Product C is missing. Drag product E\'s price to see how one outlier moves the mean but barely moves the median.');
        const cv = canvas(el, 640, 150), out = readout(el); let E = 1000;
        const c = ctrls(el); slider(c, 'Price of E', 100, 3000, 10, E, v => { E = v; draw(); });
        function draw() {
            const vals = [100, 120, 110, E], s = vals.slice().sort((a, b) => a - b);
            const mean = vals.reduce((a, b) => a + b) / 4, med = (s[1] + s[2]) / 2;
            cv.clear(); const A = axes(cv, [0, 3100], [0, 1], { yt: [], m: { l: 20, b: 26 } }); const ctx = cv.ctx;
            [['A', 100], ['B', 120], ['D', 110], ['E', E]].forEach(([n, v], i) => { dot(ctx, A.X(v), A.Y(.45), 7, '#2563eb'); text(ctx, n, A.X(v), A.Y(.45) - (i % 2 ? 16 : -22), css('ink'), 'center'); });
            line(ctx, A.X(mean), A.Y(.95), A.X(mean), A.Y(.05), '#dc2626', 2.5); text(ctx, 'mean ' + fx(mean, 1), A.X(mean) + 6, A.Y(.85), '#dc2626');
            line(ctx, A.X(med), A.Y(.95), A.X(med), A.Y(.05), '#059669', 2.5, [5, 4]); text(ctx, 'median ' + fx(med, 1), A.X(med) + 6, A.Y(.7), '#059669');
            out.textContent = `known prices: 100, 120, 110, ${E}\nmean = ${fx(mean, 2)}   median = ${fx(med, 2)}\n→ impute C with the ${E > 300 ? 'MEDIAN (E is an outlier)' : 'mean or median (no strong outlier)'}`;
        }
        draw();
    };

    /* =============== Chapter 3: skew transforms =============== */
    V.skew = el => {
        head(el, 'Taming right skew with power transforms', 'A synthetic "developer income" sample. Switch the transform and watch the long right tail shrink and the skewness approach 0.');
        const cv = canvas(el, 640, 240), out = readout(el), r = rng(11);
        const data = Array.from({ length: 600 }, () => Math.exp(10.4 + gauss(r) * 0.75));
        let mode = 'raw';
        const c = ctrls(el); select(c, 'Transform', [['raw', 'Raw income'], ['sqrt', 'Box-Cox λ = 0.5'], ['log', 'Log (Box-Cox λ = 0)']], mode, v => { mode = v; draw(); });
        const skew = a => { const n = a.length, m = a.reduce((s, v) => s + v, 0) / n, sd = Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / n); return a.reduce((s, v) => s + ((v - m) / sd) ** 3, 0) / n; };
        function draw() {
            const t = data.map(x => mode === 'log' ? Math.log(x) : mode === 'sqrt' ? (Math.sqrt(x) - 1) / 0.5 : x);
            const lo = Math.min(...t), hi = Math.max(...t), B = 30, bins = new Array(B).fill(0);
            t.forEach(v => bins[Math.min(B - 1, Math.floor((v - lo) / (hi - lo) * B))]++);
            const mx = Math.max(...bins);
            cv.clear(); const A = axes(cv, [lo, hi], [0, mx * 1.1], { m: { l: 40 }, xl: mode === 'raw' ? 'income' : 'transformed', yl: 'count' });
            const bw = (A.X(hi) - A.X(lo)) / B;
            bins.forEach((n, i) => { cv.ctx.fillStyle = (css('c') || '#4f46e5'); cv.ctx.globalAlpha = .8; cv.ctx.fillRect(A.X(lo) + i * bw + 1, A.Y(n), bw - 2, A.Y(0) - A.Y(n)); cv.ctx.globalAlpha = 1; });
            const s = skew(t);
            out.textContent = `skewness = ${fx(s, 2)}   ${Math.abs(s) < .5 ? '≈ symmetric (normal-like)' : s > 0 ? 'right-skewed (long tail of large values)' : 'left-skewed'}`;
        }
        draw();
    };

    /* =============== Chapter 3: categorical encoders =============== */
    V.encoder = el => {
        head(el, 'One-hot vs dummy vs effect coding vs hashing', 'Pick a category and see how each scheme represents it. The reference category is Gen 1.');
        const cats = ['Gen 1', 'Gen 2', 'Gen 3', 'Gen 4'];
        let sel = 'Gen 3';
        const c = ctrls(el); select(c, 'Category', cats.map(x => [x, x]), sel, v => { sel = v; draw(); });
        const host = box(el);
        const hash = s => { let h = 0; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) % 997; return h % 3; };
        function row(name, vec) { return `<tr${name === sel ? ' class="hl"' : ''}><td>${name}</td>${vec.map(v => `<td class="num">${v}</td>`).join('')}</tr>`; }
        function draw() {
            const oh = cats.map(k => cats.map(x => +(x === k)));
            const dm = cats.map(k => cats.slice(1).map(x => +(x === k)));
            const ef = cats.map((k, i) => i === 0 ? [-1, -1, -1] : cats.slice(1).map(x => +(x === k)));
            const hs = cats.map(k => [0, 1, 2].map(b => +(hash(k) === b)));
            const tbl = (title, hdr, M, note) => `<div><p class="small" style="margin:10px 0 4px"><strong>${title}</strong> <span class="muted">· ${note}</span></p><div class="tbl-wrap" style="margin:0"><table class="tbl"><tr><th>Category</th>${hdr.map(h => `<th class="num">${h}</th>`).join('')}</tr>${cats.map((k, i) => row(k, M[i])).join('')}</table></div></div>`;
            host.innerHTML = `<div class="two">${tbl('One-hot', cats, oh, 'm = 4 columns')}${tbl('Dummy', cats.slice(1), dm, 'm − 1 = 3, Gen 1 = all 0')}${tbl('Effect', cats.slice(1), ef, 'm − 1 = 3, Gen 1 = all −1')}${tbl('Feature hashing', ['b0', 'b1', 'b2'], hs, 'fixed k = 3 buckets')}</div>`;
        }
        draw();
    };

    /* =============== Chapter 3: TF-IDF =============== */
    V.tfidf = el => {
        head(el, 'TF-IDF & cosine similarity calculator', 'Edit the three documents. TF-IDF uses idf = log₁₀(N/df). Words found in every document get weight 0.');
        const docs = ['the sky is blue', 'the sun is bright today', 'the sun in the sky is bright'];
        const tas = docs.map((d, i) => { const t = document.createElement('input'); t.className = 'txt'; t.value = d; t.style.width = '100%'; t.style.marginBottom = '6px'; t.setAttribute('aria-label', 'Document ' + (i + 1)); t.addEventListener('input', draw); el.appendChild(t); return t; });
        const host = box(el);
        function draw() {
            const D = tas.map(t => t.value.toLowerCase().match(/[a-z']+/g) || []);
            const vocab = [...new Set(D.flat())].sort(), N = D.length;
            const df = Object.fromEntries(vocab.map(w => [w, D.filter(d => d.includes(w)).length]));
            const idf = Object.fromEntries(vocab.map(w => [w, Math.log10(N / df[w])]));
            const tf = D.map(d => vocab.map(w => d.filter(x => x === w).length));
            const tv = tf.map(r => r.map((v, j) => v * idf[vocab[j]]));
            const cos = (a, b) => { const d = a.reduce((s, v, i) => s + v * b[i], 0), na = Math.hypot(...a), nb = Math.hypot(...b); return na && nb ? d / (na * nb) : 0; };
            let h = `<div class="tbl-wrap"><table class="tbl"><tr><th>term</th><th class="num">df</th><th class="num">idf</th>${D.map((_, i) => `<th class="num">tf-idf d${i + 1}</th>`).join('')}</tr>`;
            vocab.forEach((w, j) => { h += `<tr><td>${esc(w)}</td><td class="num">${df[w]}</td><td class="num">${fx(idf[w])}</td>${tv.map(r => `<td class="num${r[j] > 0 ? ' hl' : ''}">${fx(r[j])}</td>`).join('')}</tr>`; });
            h += `</table></div><p class="small"><strong>Cosine similarity of the TF-IDF vectors:</strong> d1–d2 = ${fx(cos(tv[0], tv[1]))}, d1–d3 = ${fx(cos(tv[0], tv[2]))}, d2–d3 = ${fx(cos(tv[1], tv[2]))}</p>`;
            host.innerHTML = h;
        }
        draw();
    };

    /* =============== Chapter 4: scalers =============== */
    V.scalers = el => {
        head(el, 'Compare the three scalers', 'Edit the values (comma-separated). Notice how one outlier squashes min–max, while robust scaling keeps the normal values spread out.');
        const inp = document.createElement('input'); inp.className = 'txt'; inp.style.width = '100%'; inp.value = '1, 5, 25, 300, 1295, 19000'; inp.setAttribute('aria-label', 'Values'); el.appendChild(inp);
        const host = box(el); inp.addEventListener('input', draw);
        const q = (s, p) => { const k = (s.length - 1) * p, f = Math.floor(k); return s[f] + (s[Math.min(f + 1, s.length - 1)] - s[f]) * (k - f); };
        function draw() {
            const v = inp.value.split(/[,\s]+/).filter(t => t !== '').map(Number).filter(x => isFinite(x));
            if (v.length < 2) { host.innerHTML = '<p class="muted small">Enter at least two numbers.</p>'; return; }
            const n = v.length, mean = v.reduce((a, b) => a + b) / n, sd = Math.sqrt(v.reduce((a, b) => a + (b - mean) ** 2, 0) / n);
            const mn = Math.min(...v), mx = Math.max(...v), s = v.slice().sort((a, b) => a - b), med = q(s, .5), iqr = q(s, .75) - q(s, .25);
            const rows = v.map(x => `<tr><td class="num">${x.toLocaleString()}</td><td class="num">${sd ? fx((x - mean) / sd, 2) : '–'}</td><td class="num">${mx > mn ? fx((x - mn) / (mx - mn), 4) : '–'}</td><td class="num">${iqr ? fx((x - med) / iqr, 2) : '–'}</td></tr>`).join('');
            host.innerHTML = `<div class="tbl-wrap"><table class="tbl"><tr><th class="num">Raw</th><th class="num">StandardScaler (z)</th><th class="num">MinMaxScaler [0,1]</th><th class="num">RobustScaler (IQR)</th></tr>${rows}</table></div>
            <p class="small muted">μ = ${fx(mean, 2)}, σ = ${fx(sd, 2)} (population) · min = ${mn}, max = ${mx} · median = ${fx(med, 2)}, IQR = ${fx(iqr, 2)}</p>`;
        }
        draw();
    };

    /* =============== Chapter 5: linear regression =============== */
    V.linreg = el => {
        head(el, 'Least-squares line & residuals', 'Click to add a point, or click an existing point to remove it. The red lines are residuals. OLS minimises the sum of their squares.');
        const cv = canvas(el, 640, 300), out = readout(el);
        let pts = [[1, 45], [2, 52], [3, 54], [4, 61], [5, 66], [6, 74], [7, 73], [8, 82]];
        const c = ctrls(el); button(c, 'Reset', () => { pts = [[1, 45], [2, 52], [3, 54], [4, 61], [5, 66], [6, 74], [7, 73], [8, 82]]; draw(); }); button(c, 'Clear', () => { pts = []; draw(); });
        let A;
        cv.c.addEventListener('click', e => {
            const p = cv.pos(e); const hit = pts.findIndex(([x, y]) => Math.hypot(A.X(x) - p.x, A.Y(y) - p.y) < 9);
            if (hit >= 0) pts.splice(hit, 1); else pts.push([A.ix(p.x), A.iy(p.y)]); draw();
        });
        function draw() {
            cv.clear(); A = axes(cv, [0, 10], [0, 100], { xl: 'hours studied', yl: 'score' }); const ctx = cv.ctx;
            if (pts.length >= 2) {
                const n = pts.length, mx = pts.reduce((s, p) => s + p[0], 0) / n, my = pts.reduce((s, p) => s + p[1], 0) / n;
                const sxx = pts.reduce((s, p) => s + (p[0] - mx) ** 2, 0), sxy = pts.reduce((s, p) => s + (p[0] - mx) * (p[1] - my), 0);
                const m = sxx ? sxy / sxx : 0, cc = my - m * mx;
                let sse = 0; pts.forEach(([x, y]) => { const yh = m * x + cc; sse += (y - yh) ** 2; line(ctx, A.X(x), A.Y(y), A.X(x), A.Y(yh), '#dc2626', 1.5); });
                line(ctx, A.X(0), A.Y(cc), A.X(10), A.Y(m * 10 + cc), css('c') || '#0d9488', 3);
                out.textContent = `ŷ = ${fx(m, 2)}x + ${fx(cc, 2)}     SSE = Σ(y − ŷ)² = ${fx(sse, 1)}     n = ${n}\nprediction at x = 6 → ${fx(m * 6 + cc, 1)}`;
            } else out.textContent = 'Add at least two points.';
            pts.forEach(([x, y]) => dot(ctx, A.X(x), A.Y(y), 5.5, '#2563eb'));
        }
        draw();
    };

    /* =============== Chapter 5: sigmoid =============== */
    V.sigmoid = el => {
        head(el, 'The sigmoid turns a score into a probability', 'Slide z = b₀ + b₁x. At z = 0 the probability is exactly 0.5, which is the decision threshold.');
        const cv = canvas(el, 640, 230), out = readout(el); let z = 1.5;
        const c = ctrls(el); slider(c, 'z', -8, 8, 0.1, z, v => { z = v; draw(); }, v => v.toFixed(1));
        function draw() {
            cv.clear(); const A = axes(cv, [-8, 8], [0, 1], { xl: 'z', yl: 'σ(z)' }); const ctx = cv.ctx;
            line(ctx, A.X(-8), A.Y(.5), A.X(8), A.Y(.5), css('muted'), 1, [4, 4]);
            ctx.beginPath(); for (let i = 0; i <= 200; i++) { const x = -8 + 16 * i / 200, y = 1 / (1 + Math.exp(-x)); i ? ctx.lineTo(A.X(x), A.Y(y)) : ctx.moveTo(A.X(x), A.Y(y)); } ctx.strokeStyle = css('c'); ctx.lineWidth = 3; ctx.stroke();
            const p = 1 / (1 + Math.exp(-z)); dot(ctx, A.X(z), A.Y(p), 7, p >= .5 ? '#059669' : '#dc2626');
            out.textContent = `σ(${z.toFixed(1)}) = 1 / (1 + e^${(-z).toFixed(1)}) = ${fx(p, 4)}  →  predict class ${p >= .5 ? '1' : '0'}`;
        }
        draw();
    };

    /* =============== Chapter 5: Gini calculator =============== */
    V.gini = el => {
        head(el, 'Gini split calculator', 'Enter each child node\'s size and the proportion that plays (class = Yes). Presets load the lecture\'s piano example.');
        const st = { n1: 10, p1: .2, n2: 20, p2: .65 };
        const c = ctrls(el);
        const presets = { Gender: [10, .2, 20, .65], 'Other instrument': [12, .42, 18, .56], Class: [14, .43, 16, .56] };
        const ins = {};
        Object.keys(presets).forEach(k => button(c, k, () => { [st.n1, st.p1, st.n2, st.p2] = presets[k]; Object.keys(ins).forEach(key => ins[key].value = st[key]); draw(); }));
        const c2 = ctrls(el);
        ins.n1 = numIn(c2, 'Child 1 size', st.n1, v => { st.n1 = v; draw(); }, 1, 64); ins.p1 = numIn(c2, 'p(Yes)', st.p1, v => { st.p1 = v; draw(); }, .01, 72);
        ins.n2 = numIn(c2, 'Child 2 size', st.n2, v => { st.n2 = v; draw(); }, 1, 64); ins.p2 = numIn(c2, 'p(Yes)', st.p2, v => { st.p2 = v; draw(); }, .01, 72);
        const out = readout(el);
        function draw() {
            const g = p => p * p + (1 - p) ** 2, N = st.n1 + st.n2;
            if (!(N > 0) || [st.p1, st.p2].some(p => !(p >= 0 && p <= 1))) { out.textContent = 'Sizes must be positive and proportions between 0 and 1.'; return; }
            const s1 = g(st.p1), s2 = g(st.p2), w = st.n1 / N * s1 + st.n2 / N * s2;
            out.textContent = `Child 1: Σp² = ${fx(st.p1, 2)}² + ${fx(1 - st.p1, 2)}² = ${fx(s1)}   (impurity ${fx(1 - s1)})\n` +
                `Child 2: Σp² = ${fx(st.p2, 2)}² + ${fx(1 - st.p2, 2)}² = ${fx(s2)}   (impurity ${fx(1 - s2)})\n` +
                `Weighted Gini score = ${st.n1}/${N}·${fx(s1)} + ${st.n2}/${N}·${fx(s2)} = ${fx(w)}\nWeighted Gini impurity = ${fx(1 - w)}   (lower impurity = better split)`;
        }
        draw();
    };

    /* =============== Chapter 5: KNN =============== */
    V.knn = el => {
        head(el, 'K-nearest neighbours playground', 'Click anywhere to move the query point (★). Change k to see how the vote and the shaded decision regions change.');
        const cv = canvas(el, 640, 320), out = readout(el), r = rng(5);
        const pts = [];
        [[3, 3, 0], [7, 6.5, 1], [4.5, 7, 2]].forEach(([cx, cy, k]) => { for (let i = 0; i < 16; i++) pts.push([cx + gauss(r) * 1.1, cy + gauss(r) * 1.1, k]); });
        let q = [5.2, 4.8], k = 3;
        const c = ctrls(el); slider(c, 'k', 1, 15, 2, k, v => { k = v; draw(); });
        let A;
        cv.c.addEventListener('click', e => { const p = cv.pos(e); q = [A.ix(p.x), A.iy(p.y)]; draw(); });
        function classify(x, y) {
            const d = pts.map(p => [Math.hypot(p[0] - x, p[1] - y), p[2]]).sort((a, b) => a[0] - b[0]).slice(0, k);
            const v = [0, 0, 0]; d.forEach(([, c]) => v[c]++); const best = v.indexOf(Math.max(...v)); return { best, v, d };
        }
        function draw() {
            cv.clear(); A = axes(cv, [0, 10], [0, 10], { grid: false }); const ctx = cv.ctx;
            const G = 32; for (let i = 0; i < G; i++) for (let j = 0; j < G * .5; j++) {
                const x = (i + .5) / G * 10, y = (j + .5) / (G * .5) * 10; const { best } = classify(x, y);
                const x0 = Math.round(A.X(i / G * 10)), x1 = Math.round(A.X((i + 1) / G * 10)), y0 = Math.round(A.Y((j + 1) / (G * .5) * 10)), y1 = Math.round(A.Y(j / (G * .5) * 10));
                ctx.fillStyle = PAL[best]; ctx.globalAlpha = .12; ctx.fillRect(x0, y0, x1 - x0, y1 - y0); ctx.globalAlpha = 1;
            }
            const res = classify(q[0], q[1]);
            res.d.forEach(([dist]) => { const p = pts.find(pp => Math.abs(Math.hypot(pp[0] - q[0], pp[1] - q[1]) - dist) < 1e-9); if (p) line(ctx, A.X(q[0]), A.Y(q[1]), A.X(p[0]), A.Y(p[1]), css('muted'), 1.2); });
            pts.forEach(([x, y, c]) => dot(ctx, A.X(x), A.Y(y), 5, PAL[c]));
            text(ctx, '★', A.X(q[0]), A.Y(q[1]) + 7, PAL[res.best], 'center', 22, 900);
            const names = ['blue', 'red', 'green'];
            out.textContent = `k = ${k}: votes  blue ${res.v[0]} · red ${res.v[1]} · green ${res.v[2]}  →  predict ${names[res.best].toUpperCase()}\nnearest distance = ${fx(res.d[0][0], 2)}, k-th distance = ${fx(res.d[res.d.length - 1][0], 2)}`;
        }
        draw();
    };

    /* =============== Chapter 5: perceptron / XOR =============== */
    V.neuron = el => {
        head(el, 'A single perceptron: which logic gates can it learn?', 'Output = step(w₁x₁ + w₂x₂ + b). Tune the weights to make AND, OR or NAND. Then try XOR: no setting works, because XOR is not linearly separable.');
        const cv = canvas(el, 640, 260), out = readout(el); const st = { w1: 1, w2: 1, b: -1.5 };
        const c = ctrls(el);
        slider(c, 'w₁', -2, 2, .1, st.w1, v => { st.w1 = v; draw(); }, v => v.toFixed(1));
        slider(c, 'w₂', -2, 2, .1, st.w2, v => { st.w2 = v; draw(); }, v => v.toFixed(1));
        slider(c, 'b', -3, 3, .1, st.b, v => { st.b = v; draw(); }, v => v.toFixed(1));
        const X = [[0, 0], [0, 1], [1, 0], [1, 1]];
        const gates = { AND: [0, 0, 0, 1], OR: [0, 1, 1, 1], NAND: [1, 1, 1, 0], NOR: [1, 0, 0, 0], XOR: [0, 1, 1, 0] };
        function draw() {
            const y = X.map(([a, b]) => +(st.w1 * a + st.w2 * b + st.b >= 0));
            cv.clear(); const A = axes(cv, [-0.5, 1.5], [-0.5, 1.5], { xt: [0, 1], yt: [0, 1], xl: 'x₁', yl: 'x₂' }); const ctx = cv.ctx;
            ctx.save(); ctx.beginPath(); ctx.rect(A.m.l, A.m.t, cv.w - A.m.l - A.m.r, cv.h - A.m.t - A.m.b); ctx.clip();
            if (Math.abs(st.w2) > 1e-6) { const yl = x => -(st.w1 * x + st.b) / st.w2; line(ctx, A.X(-.5), A.Y(yl(-.5)), A.X(1.5), A.Y(yl(1.5)), css('c'), 2.5); }
            else if (Math.abs(st.w1) > 1e-6) { const xv = -st.b / st.w1; line(ctx, A.X(xv), A.Y(-.5), A.X(xv), A.Y(1.5), css('c'), 2.5); }
            ctx.restore();
            X.forEach(([a, b], i) => { dot(ctx, A.X(a), A.Y(b), 11, y[i] ? '#059669' : '#dc2626'); text(ctx, String(y[i]), A.X(a), A.Y(b) + 4, '#fff', 'center', 12, 800); });
            const match = Object.entries(gates).filter(([, g]) => g.every((v, i) => v === y[i])).map(([n]) => n);
            out.textContent = `truth table (x₁x₂ → y): 00→${y[0]}  01→${y[1]}  10→${y[2]}  11→${y[3]}\n${match.length ? 'This perceptron computes ' + match.join(' / ') + '.' : 'Not a standard gate.'}  XOR target: 0 1 1 0 needs a hidden layer (OR and NOT AND).`;
        }
        draw();
    };

    /* =============== Chapter 6: K-means =============== */
    V.kmeans = el => {
        head(el, 'K-means step by step', 'Step alternates between the E-step (assign each point to the nearest centroid) and the M-step (move each centroid to the mean of its points). Large × = centroid.');
        const cv = canvas(el, 640, 320), out = readout(el); let r = rng(3);
        const pts = []; [[2.5, 3], [7, 7], [7.5, 2.5]].forEach(([x, y]) => { for (let i = 0; i < 25; i++) pts.push([x + gauss(r) * 1, y + gauss(r) * 1]); });
        let k = 3, cents, assign, phase, iter, seed = 1;
        const c = ctrls(el);
        slider(c, 'k', 2, 6, 1, k, v => { k = v; reset(); });
        button(c, 'Step', step, true); button(c, 'Run to convergence', () => { for (let i = 0; i < 50 && step(); i++); }); button(c, 'New random start', () => { seed++; reset(); });
        function reset() { const rr = rng(100 + seed); cents = Array.from({ length: k }, () => [1 + rr() * 8, 1 + rr() * 8]); assign = pts.map(() => -1); phase = 'E'; iter = 0; draw('Random centroids placed. Press Step.'); }
        function step() {
            if (phase === 'E') {
                let changed = false;
                pts.forEach((p, i) => { let b = 0, bd = 1e9; cents.forEach((cc, j) => { const d = Math.hypot(p[0] - cc[0], p[1] - cc[1]); if (d < bd) { bd = d; b = j; } }); if (assign[i] !== b) changed = true; assign[i] = b; });
                phase = 'M'; iter++;
                draw(changed ? `Iteration ${iter} · E-step: each point assigned to its nearest centroid.` : `Converged after ${iter - 1} iterations: no assignment changed.`);
                return changed;
            }
            cents = cents.map((cc, j) => { const m = pts.filter((_, i) => assign[i] === j); return m.length ? [m.reduce((s, p) => s + p[0], 0) / m.length, m.reduce((s, p) => s + p[1], 0) / m.length] : cc; });
            phase = 'E'; draw(`Iteration ${iter} · M-step: each centroid moved to the mean of its cluster.`); return true;
        }
        function draw(msg) {
            cv.clear(); const A = axes(cv, [0, 10], [0, 10], { grid: false }); const ctx = cv.ctx;
            pts.forEach((p, i) => dot(ctx, A.X(p[0]), A.Y(p[1]), 5, assign[i] < 0 ? css('muted') : PAL[assign[i]]));
            cents.forEach((cc, j) => { const x = A.X(cc[0]), y = A.Y(cc[1]); line(ctx, x - 9, y - 9, x + 9, y + 9, css('ink'), 5); line(ctx, x - 9, y + 9, x + 9, y - 9, css('ink'), 5); line(ctx, x - 8, y - 8, x + 8, y + 8, PAL[j], 3); line(ctx, x - 8, y + 8, x + 8, y - 8, PAL[j], 3); });
            const wcss = assign[0] < 0 ? null : pts.reduce((s, p, i) => s + (p[0] - cents[assign[i]][0]) ** 2 + (p[1] - cents[assign[i]][1]) ** 2, 0);
            out.textContent = `${msg || ''}\nk = ${k}${wcss != null ? `   within-cluster sum of squares = ${fx(wcss, 1)}` : ''}`;
        }
        reset();
    };

    /* =============== Chapter 6: dendrogram =============== */
    V.dendro = el => {
        head(el, 'Agglomerative clustering & the dendrogram', 'Drag the cut height. The number of vertical lines the cut crosses is the number of clusters. Try different linkage methods.');
        const P = [[1, 1], [1.6, 1.4], [1.2, 2.2], [5, 5], [5.6, 4.5], [6.2, 5.6], [9, 1.5], [8.4, 2.2]], names = 'ABCDEFGH'.split('');
        const cv = canvas(el, 640, 280), out = readout(el); let link = 'single', cut = 2.5, merges, maxH;
        const c = ctrls(el);
        select(c, 'Linkage', [['single', 'Single'], ['complete', 'Complete'], ['average', 'Average']], link, v => { link = v; build(); draw(); });
        const sl = slider(c, 'Cut height', 0, 10, .05, cut, v => { cut = v; draw(); }, v => v.toFixed(2));
        const dist = (a, b) => Math.hypot(P[a][0] - P[b][0], P[a][1] - P[b][1]);
        function build() {
            let cl = P.map((_, i) => ({ id: i, m: [i] })); merges = []; let next = P.length;
            while (cl.length > 1) {
                let best = [0, 1, 1e9];
                for (let i = 0; i < cl.length; i++) for (let j = i + 1; j < cl.length; j++) {
                    const ds = []; cl[i].m.forEach(a => cl[j].m.forEach(b => ds.push(dist(a, b))));
                    const d = link === 'single' ? Math.min(...ds) : link === 'complete' ? Math.max(...ds) : ds.reduce((s, v) => s + v) / ds.length;
                    if (d < best[2]) best = [i, j, d];
                }
                const [i, j, d] = best, nc = { id: next++, m: cl[i].m.concat(cl[j].m), a: cl[i], b: cl[j], h: d };
                merges.push(nc); cl = cl.filter((_, k) => k !== i && k !== j); cl.push(nc);
            }
            maxH = merges[merges.length - 1].h; sl.max = (maxH * 1.1).toFixed(2); if (cut > maxH * 1.1) { cut = maxH * .5; sl.value = cut; sl.dispatchEvent(new Event('input')); }
        }
        function draw() {
            cv.clear(); const ctx = cv.ctx, W = cv.w, H = cv.h;
            // clusters below cut
            const parent = P.map((_, i) => i); const find = x => parent[x] === x ? x : (parent[x] = find(parent[x]));
            merges.filter(m => m.h <= cut).forEach(m => m.m.forEach(x => parent[find(x)] = find(m.m[0])));
            const roots = [...new Set(P.map((_, i) => find(i)))], col = i => PAL[roots.indexOf(find(i)) % PAL.length];
            // scatter (left)
            const sx = x => 20 + x / 10 * 220, sy = y => H - 30 - y / 7 * (H - 50);
            P.forEach(([x, y], i) => { dot(ctx, sx(x), sy(y), 7, col(i)); text(ctx, names[i], sx(x) + 10, sy(y) + 4, css('ink')); });
            line(ctx, 262, 10, 262, H - 10, css('line'), 1);
            // dendrogram (right)
            const root = merges[merges.length - 1], order = [];
            (function walk(n) { if (n.a) { walk(n.a); walk(n.b); } else order.push(n.id); })(root);
            const lx = i => 290 + order.indexOf(i) * ((W - 310) / (P.length - 1)), hy = h => H - 30 - h / (maxH * 1.1) * (H - 50);
            const pos = n => n.a ? { x: (pos(n.a).x + pos(n.b).x) / 2, y: hy(n.h) } : { x: lx(n.id), y: H - 30 };
            ctx.lineWidth = 2;
            merges.forEach(m => { const a = pos(m.a), b = pos(m.b), y = hy(m.h), cc = m.h <= cut ? col(m.m[0]) : css('muted'); line(ctx, a.x, a.y, a.x, y, cc); line(ctx, b.x, b.y, b.x, y, cc); line(ctx, a.x, y, b.x, y, cc); });
            P.forEach((_, i) => text(ctx, names[i], lx(i), H - 12, css('ink'), 'center'));
            line(ctx, 280, hy(cut), W - 10, hy(cut), '#dc2626', 2, [6, 4]); text(ctx, 'cut', W - 12, hy(cut) - 6, '#dc2626', 'right');
            out.textContent = `${link} linkage · cut at ${cut.toFixed(2)} → ${roots.length} cluster${roots.length > 1 ? 's' : ''}: ` + roots.map(rt => '{' + P.map((_, i) => i).filter(i => find(i) === rt).map(i => names[i]).join(',') + '}').join(' ');
        }
        build(); draw();
    };

    /* =============== Chapter 6: association rules =============== */
    V.assoc = el => {
        head(el, 'Support · confidence · lift calculator', 'One transaction per line, items separated by commas. Choose a rule A → B.');
        const ta = document.createElement('textarea'); ta.className = 'txt'; ta.rows = 5; ta.style.width = '100%'; ta.style.fontFamily = 'JetBrains Mono, monospace'; ta.style.fontSize = '13px';
        ta.value = 'milk, bread\nbread, diaper, beer, eggs\nmilk, diaper, beer, cola\nbread, milk, diaper, beer\nbread, milk, diaper, cola'; ta.setAttribute('aria-label', 'Transactions'); el.appendChild(ta);
        const c = ctrls(el); let A = 'diaper', B = 'beer'; let sA, sB;
        const out = readout(el);
        function items() { return [...new Set(ta.value.split('\n').flatMap(l => l.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)))].sort(); }
        function rebuild() {
            const it = items(); c.innerHTML = '';
            if (!it.includes(A)) A = it[0]; if (!it.includes(B)) B = it[1] || it[0];
            sA = select(c, 'A (if)', it.map(x => [x, x]), A, v => { A = v; draw(); });
            sB = select(c, 'B (then)', it.map(x => [x, x]), B, v => { B = v; draw(); });
            draw();
        }
        function draw() {
            const T = ta.value.split('\n').map(l => l.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)).filter(t => t.length);
            const N = T.length; if (!N) { out.textContent = 'Add some transactions.'; return; }
            const cA = T.filter(t => t.includes(A)).length, cB = T.filter(t => t.includes(B)).length, cAB = T.filter(t => t.includes(A) && t.includes(B)).length;
            const sa = cA / N, sb = cB / N, sab = cAB / N, conf = cA ? sab / sa : 0, lift = sb ? conf / sb : 0;
            out.textContent = `N = ${N} transactions\nsupp(${A}) = ${cA}/${N} = ${fx(sa)}    supp(${B}) = ${cB}/${N} = ${fx(sb)}    supp(${A} ∪ ${B}) = ${cAB}/${N} = ${fx(sab)}\n` +
                `confidence(${A} → ${B}) = ${fx(sab)} / ${fx(sa)} = ${fx(conf)}\nlift = ${fx(conf)} / ${fx(sb)} = ${fx(lift)}   → ${lift > 1.001 ? 'positive association' : lift < .999 ? 'negative association' : 'independent'}`;
        }
        ta.addEventListener('input', rebuild); rebuild();
    };

    /* =============== Chapter 6: PCA =============== */
    V.pca = el => {
        head(el, 'PCA finds the direction of maximum variance', 'Change the shape of the data cloud. PC1 (solid) follows the longest spread. PC2 (dashed) is perpendicular and uncorrelated with it.');
        const cv = canvas(el, 640, 300), out = readout(el); let ang = 30, ratio = 3.5, proj = false;
        const c = ctrls(el);
        slider(c, 'Angle', 0, 180, 1, ang, v => { ang = v; draw(); }, v => v + '°');
        slider(c, 'Elongation', 1, 6, .1, ratio, v => { ratio = v; draw(); }, v => v.toFixed(1));
        const pb = button(c, 'Project onto PC1', () => { proj = !proj; pb.textContent = proj ? 'Hide projection' : 'Project onto PC1'; draw(); });
        function draw() {
            const r = rng(21), t = ang * Math.PI / 180;
            const pts = Array.from({ length: 120 }, () => { const a = gauss(r) * ratio * .5, b = gauss(r) * .5; return [a * Math.cos(t) - b * Math.sin(t), a * Math.sin(t) + b * Math.cos(t)]; });
            const n = pts.length, mx = pts.reduce((s, p) => s + p[0], 0) / n, my = pts.reduce((s, p) => s + p[1], 0) / n;
            const sxx = pts.reduce((s, p) => s + (p[0] - mx) ** 2, 0) / (n - 1), syy = pts.reduce((s, p) => s + (p[1] - my) ** 2, 0) / (n - 1), sxy = pts.reduce((s, p) => s + (p[0] - mx) * (p[1] - my), 0) / (n - 1);
            const tr = sxx + syy, det = sxx * syy - sxy * sxy, l1 = tr / 2 + Math.sqrt(tr * tr / 4 - det), l2 = tr / 2 - Math.sqrt(Math.max(0, tr * tr / 4 - det));
            let v1 = Math.abs(sxy) > 1e-9 ? [l1 - syy, sxy] : (sxx >= syy ? [1, 0] : [0, 1]); const nn = Math.hypot(...v1); v1 = [v1[0] / nn, v1[1] / nn]; const v2 = [-v1[1], v1[0]];
            cv.clear(); const A = axes(cv, [-6.5, 6.5], [-3.1, 3.1], { grid: true }); const ctx = cv.ctx;
            pts.forEach(([x, y]) => {
                if (proj) { const s = (x - mx) * v1[0] + (y - my) * v1[1], px = mx + s * v1[0], py = my + s * v1[1]; line(ctx, A.X(x), A.Y(y), A.X(px), A.Y(py), css('line'), 1); dot(ctx, A.X(px), A.Y(py), 3, '#d97706'); }
                dot(ctx, A.X(x), A.Y(y), 3.5, '#2563eb');
            });
            const s1 = Math.sqrt(l1) * 2, s2 = Math.sqrt(l2) * 2;
            line(ctx, A.X(mx - v1[0] * s1), A.Y(my - v1[1] * s1), A.X(mx + v1[0] * s1), A.Y(my + v1[1] * s1), css('c'), 3.5);
            line(ctx, A.X(mx - v2[0] * s2), A.Y(my - v2[1] * s2), A.X(mx + v2[0] * s2), A.Y(my + v2[1] * s2), css('c'), 2.5, [6, 4]);
            text(ctx, 'PC1', A.X(mx + v1[0] * s1) + 6, A.Y(my + v1[1] * s1), css('c'), 'left', 13, 800);
            out.textContent = `eigenvalues λ₁ = ${fx(l1, 2)}, λ₂ = ${fx(l2, 2)}\nPC1 explains ${fx(l1 / (l1 + l2) * 100, 1)}% of variance · PC2 explains ${fx(l2 / (l1 + l2) * 100, 1)}%${proj ? '\nOrange = data compressed to 1-D (PC1 only)' : ''}`;
        }
        draw();
    };

    /* =============== Chapter 7: RL loop diagram =============== */
    V.rlloop = el => {
        head(el, 'The agent–environment loop', 'At each time step t the agent observes a state, acts, and receives a reward and a new state.');
        el.insertAdjacentHTML('beforeend', `<svg viewBox="0 0 640 210" style="width:100%;display:block" role="img" aria-label="Agent environment interaction loop">
        <defs><marker id="ah" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
        <g style="color:var(--c)" fill="none" stroke="currentColor" stroke-width="2.5">
          <rect x="60" y="70" width="150" height="70" rx="14" fill="var(--c-soft)"/>
          <rect x="430" y="70" width="150" height="70" rx="14" fill="var(--surface-2)" stroke="var(--muted)"/>
          <path d="M210 92 C 300 40, 340 40, 428 92" marker-end="url(#ah)"/>
          <path d="M430 120 C 340 172, 300 172, 212 120" marker-end="url(#ah)" stroke="var(--good)" style="color:var(--good)"/>
        </g>
        <text x="135" y="104" text-anchor="middle" font-weight="800" font-size="16" fill="var(--ink)">AGENT</text>
        <text x="135" y="124" text-anchor="middle" font-size="12" fill="var(--muted)">policy π(s) → a</text>
        <text x="505" y="104" text-anchor="middle" font-weight="800" font-size="16" fill="var(--ink)">ENVIRONMENT</text>
        <text x="505" y="124" text-anchor="middle" font-size="12" fill="var(--muted)">the world / game</text>
        <text x="320" y="38" text-anchor="middle" font-weight="700" font-size="13" fill="var(--ink)">action aₜ</text>
        <text x="320" y="190" text-anchor="middle" font-weight="700" font-size="13" fill="var(--ink)">reward rₜ₊₁ + new state sₜ₊₁</text></svg>`);
    };

    /* =============== Chapter 7: Q update =============== */
    V.qupdate = el => {
        head(el, 'Q-learning update calculator', 'Change any value and see each step of the update.');
        const st = { a: .9, g: .75, q: 2, r: 5, m: 8 };
        const c = ctrls(el);
        numIn(c, 'α', st.a, v => { st.a = v; draw(); }, .05, 70); numIn(c, 'γ', st.g, v => { st.g = v; draw(); }, .05, 70);
        numIn(c, 'Q(s,a)', st.q, v => { st.q = v; draw(); }, .1, 70); numIn(c, 'r', st.r, v => { st.r = v; draw(); }, .1, 70); numIn(c, 'max Q(s′,·)', st.m, v => { st.m = v; draw(); }, .1, 70);
        const out = readout(el);
        function draw() {
            if (Object.values(st).some(v => !isFinite(v))) { out.textContent = 'Enter numbers in every box.'; return; }
            const tgt = st.r + st.g * st.m, err = tgt - st.q, nq = st.q + st.a * err;
            out.textContent = `TD target = r + γ·maxQ′ = ${st.r} + ${st.g} × ${st.m} = ${fx(tgt, 4)}\nTD error  = target − Q = ${fx(tgt, 4)} − ${st.q} = ${fx(err, 4)}\nnew Q     = Q + α·error = ${st.q} + ${st.a} × ${fx(err, 4)} = ${fx(nq, 4)}` +
                (st.a > 1 || st.a <= 0 ? '\n⚠ α should be in (0, 1]' : '') + (st.g < 0 || st.g > 1 ? '\n⚠ γ should be in [0, 1]' : '');
        }
        draw();
    };

    /* =============== Chapter 7: gridworld =============== */
    V.gridworld = el => {
        head(el, 'Q-learning gridworld', 'S = start, G = goal (+10), P = pit (−10), striped = wall, −1 per step. Train and watch the Q-values and greedy arrows (the policy) emerge.');
        const R = 5, C = 5, layout = ['....G', '.##.P', '.....', '.#.#.', 'S....'];
        const cell = (r, c) => layout[r][c];
        let Q, alpha = .5, gamma = .9, eps = .2, episodes = 0, agent = null, r = rng(9);
        const grid = document.createElement('div'); grid.className = 'qgrid'; grid.style.gridTemplateColumns = `repeat(${C},1fr)`; el.appendChild(grid);
        const c = ctrls(el);
        slider(c, 'α', .05, 1, .05, alpha, v => alpha = v, v => v.toFixed(2));
        slider(c, 'γ', 0, 1, .05, gamma, v => gamma = v, v => v.toFixed(2));
        slider(c, 'ε', 0, 1, .05, eps, v => eps = v, v => v.toFixed(2));
        const c2 = ctrls(el);
        button(c2, 'Train 1 episode', () => { train(1); }, true); button(c2, 'Train 100', () => train(100)); button(c2, 'Show greedy path', walk); button(c2, 'Reset', reset);
        const out = readout(el);
        const moves = [[-1, 0], [0, 1], [1, 0], [0, -1]], arrows = ['↑', '→', '↓', '←'];
        function reset() { Q = Array.from({ length: R * C }, () => [0, 0, 0, 0]); episodes = 0; agent = null; draw('Q-table reset to zeros.'); }
        function stepEnv(s, a) {
            const rr = Math.floor(s / C), cc = s % C; let nr = rr + moves[a][0], nc = cc + moves[a][1];
            if (nr < 0 || nr >= R || nc < 0 || nc >= C || cell(nr, nc) === '#') { nr = rr; nc = cc; }
            const ns = nr * C + nc, t = cell(nr, nc);
            return t === 'G' ? [ns, 10, true] : t === 'P' ? [ns, -10, true] : [ns, -1, false];
        }
        const argmax = a => a.indexOf(Math.max(...a));
        function train(n) {
            let lastSteps = 0, lastRet = 0;
            for (let e = 0; e < n; e++) {
                let s = 4 * C, done = false, steps = 0, ret = 0;
                while (!done && steps < 100) {
                    const a = r() < eps ? Math.floor(r() * 4) : (Q[s].every(v => v === Q[s][0]) ? Math.floor(r() * 4) : argmax(Q[s]));
                    const [ns, rew, d] = stepEnv(s, a);
                    const target = rew + (d ? 0 : gamma * Math.max(...Q[ns]));
                    Q[s][a] += alpha * (target - Q[s][a]);
                    s = ns; done = d; steps++; ret += rew;
                }
                episodes++; lastSteps = steps; lastRet = ret;
            }
            draw(`Episodes trained: ${episodes} · last episode: ${lastSteps} steps, return ${lastRet}`);
        }
        function walk() {
            let s = 4 * C, path = [s], seen = new Set([s]);
            for (let i = 0; i < 25; i++) { const [ns, , d] = stepEnv(s, argmax(Q[s])); s = ns; path.push(s); if (d || seen.has(s)) break; seen.add(s); }
            let i = 0; const tick = () => { agent = path[i]; draw(`Following the greedy policy: step ${i}/${path.length - 1}`); if (++i < path.length) setTimeout(tick, 220); else { const t = cell(Math.floor(agent / C), agent % C); draw(t === 'G' ? 'Greedy policy reaches the goal. 🎉' : t === 'P' ? 'Greedy policy falls in the pit. Train more.' : 'Greedy policy loops or gets stuck. Train more.'); } };
            tick();
        }
        function draw(msg) {
            grid.innerHTML = '';
            for (let s = 0; s < R * C; s++) {
                const rr = Math.floor(s / C), cc = s % C, t = cell(rr, cc), d = document.createElement('div');
                if (t === '#') d.className = 'wall';
                else if (t === 'G') { d.className = 'goal'; d.textContent = 'G +10'; }
                else if (t === 'P') { d.className = 'pit'; d.textContent = 'P −10'; }
                else {
                    const mx = Math.max(...Q[s]), trained = Q[s].some(v => v !== 0);
                    d.innerHTML = `${t === 'S' ? '<b style="position:absolute;top:3px;left:5px;font-size:10px">S</b>' : ''}<span class="arr">${trained ? arrows[argmax(Q[s])] : ''}</span><span style="position:absolute;bottom:3px;font-size:10px">${trained ? mx.toFixed(1) : ''}</span>`;
                    if (trained) d.style.background = mx >= 0 ? `color-mix(in srgb, var(--good) ${Math.min(45, mx * 5 + 5)}%, var(--surface-2))` : `color-mix(in srgb, var(--bad) ${Math.min(40, -mx * 4)}%, var(--surface-2))`;
                }
                if (s === agent) d.classList.add('agent');
                grid.appendChild(d);
            }
            out.textContent = msg || '';
        }
        reset();
    };

    /* =============== Chapter 8: activations =============== */
    V.activations = el => {
        head(el, 'Sigmoid, tanh and ReLU', 'Slide x to compare the outputs.');
        const cv = canvas(el, 640, 240), out = readout(el); let x0 = 1;
        const c = ctrls(el); slider(c, 'x', -5, 5, .1, x0, v => { x0 = v; draw(); }, v => v.toFixed(1));
        const F = [['sigmoid', x => 1 / (1 + Math.exp(-x)), '#2563eb'], ['tanh', Math.tanh, '#d97706'], ['ReLU', x => Math.max(0, x), '#059669']];
        function draw() {
            cv.clear(); const A = axes(cv, [-5, 5], [-1.5, 3], { xl: 'x' }); const ctx = cv.ctx;
            ctx.save(); ctx.beginPath(); ctx.rect(A.m.l, A.m.t, cv.w - A.m.l - A.m.r, cv.h - A.m.t - A.m.b); ctx.clip();
            F.forEach(([n, f, col], k) => { ctx.beginPath(); for (let i = 0; i <= 200; i++) { const x = -5 + 10 * i / 200; i ? ctx.lineTo(A.X(x), A.Y(f(x))) : ctx.moveTo(A.X(x), A.Y(f(x))); } ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.stroke(); dot(ctx, A.X(x0), A.Y(f(x0)), 5.5, col); text(ctx, n, A.m.l + 10 + k * 80, A.m.t + 14, col, 'left', 13, 800); });
            ctx.restore(); line(ctx, A.X(x0), A.m.t, A.X(x0), cv.h - A.m.b, css('muted'), 1, [4, 4]);
            out.textContent = F.map(([n, f]) => `${n}(${x0.toFixed(1)}) = ${fx(f(x0), 4)}`).join('    ');
        }
        draw();
    };

    /* =============== Chapter 8: LSTM cell =============== */
    V.lstm = el => {
        head(el, 'One LSTM cell step', 'Gate values are in (0,1). The candidate c̃ is in (−1,1). See how forgetting and writing combine into the new memory.');
        const st = { c: .8, f: .9, i: .6, ct: .5, o: .7 };
        const c = ctrls(el);
        slider(c, 'c₍t−1₎', -2, 2, .05, st.c, v => { st.c = v; draw(); }, v => v.toFixed(2));
        slider(c, 'forget f', 0, 1, .05, st.f, v => { st.f = v; draw(); }, v => v.toFixed(2));
        slider(c, 'input i', 0, 1, .05, st.i, v => { st.i = v; draw(); }, v => v.toFixed(2));
        slider(c, 'candidate c̃', -1, 1, .05, st.ct, v => { st.ct = v; draw(); }, v => v.toFixed(2));
        slider(c, 'output o', 0, 1, .05, st.o, v => { st.o = v; draw(); }, v => v.toFixed(2));
        const out = readout(el);
        function draw() {
            const keep = st.f * st.c, add = st.i * st.ct, cn = keep + add, h = st.o * Math.tanh(cn);
            out.textContent = `retain  f × c₍t−1₎ = ${st.f.toFixed(2)} × ${st.c.toFixed(2)} = ${fx(keep)}\nadd     i × c̃      = ${st.i.toFixed(2)} × ${st.ct.toFixed(2)} = ${fx(add)}\n` +
                `cell    cₜ = ${fx(keep)} + ${fx(add)} = ${fx(cn)}\nhidden  hₜ = o × tanh(cₜ) = ${st.o.toFixed(2)} × ${fx(Math.tanh(cn))} = ${fx(h)}` +
                (st.f < .1 ? '\n→ forget gate ≈ 0: old memory is erased' : st.f > .95 && st.i < .05 ? '\n→ memory carried forward almost unchanged' : '');
        }
        draw();
    };

    /* =============== Chapter 8: sliding windows =============== */
    V.window = el => {
        head(el, 'Sliding-window sequence builder', 'Edit the series and window size to see the supervised pairs and the resulting tensor shape.');
        const inp = document.createElement('input'); inp.className = 'txt'; inp.style.width = '100%'; inp.value = '10, 12, 15, 18, 20, 23'; inp.setAttribute('aria-label', 'Series'); el.appendChild(inp);
        let w = 3; const c = ctrls(el); slider(c, 'Window size', 1, 6, 1, w, v => { w = v; draw(); });
        const host = box(el); inp.addEventListener('input', draw);
        function draw() {
            const s = inp.value.split(/[,\s]+/).filter(t => t !== '').map(Number).filter(x => isFinite(x));
            const pairs = []; for (let i = 0; i + w < s.length; i++) pairs.push([s.slice(i, i + w), s[i + w]]);
            host.innerHTML = pairs.length ? `<div class="tbl-wrap"><table class="tbl"><tr><th>#</th><th>Input window</th><th>Target</th></tr>${pairs.map((p, i) => `<tr><td>${i + 1}</td><td>${p[0].join(', ')}</td><td class="hl">${p[1]}</td></tr>`).join('')}</table></div>
                <p class="small">X.shape = (<strong>${pairs.length}</strong> samples, <strong>${w}</strong> time steps, <strong>1</strong> feature) · y.shape = (${pairs.length},)</p>` : '<p class="muted small">The series is too short for this window size.</p>';
        }
        draw();
    };

    /* =============== Chapter 8: convolution =============== */
    V.conv = el => {
        head(el, 'Convolution step by step', 'The kernel slides over the input. At each position it multiplies element-wise and sums the result into one output cell. Change the stride, padding or kernel.');
        const IMG = [[1, 1, 1, 0, 0], [0, 1, 1, 1, 0], [0, 0, 1, 1, 1], [0, 0, 1, 1, 0], [0, 1, 1, 0, 0]];
        const KERNELS = { x: [[1, 0, 1], [0, 1, 0], [1, 0, 1]], edge: [[1, 0, -1], [1, 0, -1], [1, 0, -1]], blur: [[1, 1, 1], [1, 1, 1], [1, 1, 1]] };
        let kn = 'x', S = 1, Pd = 0, pos = 0;
        const c = ctrls(el);
        select(c, 'Kernel', [['x', 'Lecture "X" kernel'], ['edge', 'Vertical edge'], ['blur', 'Box blur (sum)']], kn, v => { kn = v; pos = 0; draw(); });
        select(c, 'Stride', [['1', '1'], ['2', '2']], '1', v => { S = +v; pos = 0; draw(); });
        select(c, 'Padding', [['0', 'VALID (0)'], ['1', 'SAME (1)']], '0', v => { Pd = +v; pos = 0; draw(); });
        const c2 = ctrls(el); let timer = null;
        button(c2, '← Prev', () => { pos = Math.max(0, pos - 1); draw(); }); button(c2, 'Next →', () => { pos++; draw(); }, true);
        const play = button(c2, '▶ Play', () => { if (timer) { clearInterval(timer); timer = null; play.textContent = '▶ Play'; return; } play.textContent = '❚❚ Pause'; timer = setInterval(() => { pos++; draw(); if (!el.isConnected) clearInterval(timer); }, 700); });
        const host = box(el), out = readout(el);
        function draw() {
            const K = KERNELS[kn], n = IMG.length + 2 * Pd;
            const I = Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => { const rr = r - Pd, cc = c - Pd; return rr >= 0 && cc >= 0 && rr < 5 && cc < 5 ? IMG[rr][cc] : 0; }));
            const o = Math.floor((n - 3) / S) + 1, total = o * o;
            if (pos >= total) { pos = total - 1; if (timer) { clearInterval(timer); timer = null; play.textContent = '▶ Play'; } }
            const O = Array.from({ length: o }, (_, r) => Array.from({ length: o }, (_, c) => { let s = 0; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) s += I[r * S + i][c * S + j] * K[i][j]; return s; }));
            const pr = Math.floor(pos / o), pc = pos % o, r0 = pr * S, c0 = pc * S;
            const Ishow = I.map((row, r) => row.map((v, c) => (r < Pd || c < Pd || r >= n - Pd || c >= n - Pd) ? `<i style="opacity:.45">${v}</i>` : v));
            const Oshow = O.map((row, r) => row.map((v, c) => (r * o + c) <= pos ? v : '·'));
            host.innerHTML = `<div class="mat-row" style="margin:8px 0">
                <div><span class="lab">Input ${n}×${n}${Pd ? ' (padded)' : ''}</span>${matHTML(Ishow, (r, c) => r >= r0 && r < r0 + 3 && c >= c0 && c < c0 + 3 ? 'on' : '')}</div>
                <div style="font-size:22px;font-weight:900;color:var(--c)">⊛</div>
                <div><span class="lab">Kernel 3×3</span>${matHTML(K)}</div>
                <div style="font-size:22px;font-weight:900;color:var(--c)">=</div>
                <div><span class="lab">Output ${o}×${o}</span>${matHTML(Oshow, (r, c) => r === pr && c === pc ? 'out' : '')}</div></div>`;
            const terms = []; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if (K[i][j]) terms.push(`${I[r0 + i][c0 + j]}×${K[i][j]}`);
            out.textContent = `position ${pos + 1}/${total} (row ${pr}, col ${pc}): ${terms.join(' + ')} = ${O[pr][pc]}\noutput size = ⌊(5 − 3 + 2·${Pd}) / ${S}⌋ + 1 = ${o}`;
        }
        draw();
    };

    /* =============== Chapter 8: conv size / params calculator =============== */
    V.convcalc = el => {
        head(el, 'CNN layer calculator', 'Output size and parameter count for one conv layer, compared with a dense layer on the same input.');
        const st = { W: 32, F: 3, P: 1, S: 1, K: 32, C: 3 };
        const c = ctrls(el);
        numIn(c, 'Input W', st.W, v => { st.W = v; draw(); }, 1, 66); numIn(c, 'Filter F', st.F, v => { st.F = v; draw(); }, 1, 60); numIn(c, 'Padding P', st.P, v => { st.P = v; draw(); }, 1, 60);
        numIn(c, 'Stride S', st.S, v => { st.S = v; draw(); }, 1, 60); numIn(c, 'Filters K', st.K, v => { st.K = v; draw(); }, 1, 66); numIn(c, 'Channels C', st.C, v => { st.C = v; draw(); }, 1, 60);
        const out = readout(el);
        function draw() {
            const { W, F, P, S, K, C } = st;
            if ([W, F, P, S, K, C].some(v => !isFinite(v)) || S <= 0 || F <= 0) { out.textContent = 'Enter positive whole numbers.'; return; }
            const raw = (W - F + 2 * P) / S + 1, o = Math.floor((W - F + 2 * P) / S) + 1, params = (F * F * C + 1) * K, dense = W * W * C * 100 + 100;
            out.textContent = `output = ⌊(${W} − ${F} + 2·${P}) / ${S}⌋ + 1 = ${o}  →  ${o} × ${o} × ${K}` + (Number.isInteger(raw) ? '' : `\n⚠ (W − F + 2P)/S is not an integer (${fx(raw, 3)}), so the filter doesn't tile the input exactly`) +
                `\nconv parameters = (${F}·${F}·${C} + 1) × ${K} = ${params.toLocaleString()}\nfor comparison, a dense layer of 100 units on ${W}×${W}×${C} = ${dense.toLocaleString()} parameters\nflattened output size = ${(o * o * K).toLocaleString()}`;
        }
        draw();
    };

    /* =============== Chapter 8: pooling =============== */
    V.pool = el => {
        head(el, 'Max vs average pooling', 'Click any output cell to highlight the 2×2 window it summarises (stride 2).');
        const I = [[12, 20, 30, 0], [8, 12, 2, 0], [34, 70, 37, 4], [112, 100, 25, 12]];
        let sel = [0, 0]; const host = box(el), out = readout(el);
        host.addEventListener('click', e => { const s = e.target.closest('[data-pr]'); if (s) { sel = [+s.dataset.pr, +s.dataset.pc]; draw(); } });
        function win(r, c) { return [I[2 * r][2 * c], I[2 * r][2 * c + 1], I[2 * r + 1][2 * c], I[2 * r + 1][2 * c + 1]]; }
        function draw() {
            const mx = [0, 1].map(r => [0, 1].map(c => Math.max(...win(r, c)))), av = [0, 1].map(r => [0, 1].map(c => win(r, c).reduce((a, b) => a + b) / 4));
            const outM = M => `<div class="grid-mat" style="grid-template-columns:repeat(2,auto)">${M.flat().map((v, k) => { const r = k >> 1, c = k & 1; return `<span data-pr="${r}" data-pc="${c}" style="cursor:pointer" class="${r === sel[0] && c === sel[1] ? 'out' : ''}">${v}</span>`; }).join('')}</div>`;
            host.innerHTML = `<div class="mat-row"><div><span class="lab">Input 4×4</span>${matHTML(I, (r, c) => Math.floor(r / 2) === sel[0] && Math.floor(c / 2) === sel[1] ? 'on' : '')}</div>
                <div><span class="lab">Max pool</span>${outM(mx)}</div><div><span class="lab">Average pool</span>${outM(av)}</div></div>`;
            const w = win(...sel);
            out.textContent = `window {${w.join(', ')}}\nmax = ${Math.max(...w)}    average = (${w.join(' + ')}) / 4 = ${w.reduce((a, b) => a + b) / 4}`;
        }
        draw();
    };

    /* =============== Chapter 8: softmax =============== */
    V.softmax = el => {
        head(el, 'Softmax: scores to probabilities', 'Adjust the raw scores (logits). Probabilities always sum to 1. Pick the true class to see the cross-entropy loss.');
        const z = [1, 0.5, 2.5, 0.5, -0.5]; let truth = 2;
        const c = ctrls(el);
        z.forEach((v, i) => slider(c, `z${i + 1}`, -4, 6, .1, v, x => { z[i] = x; draw(); }, x => x.toFixed(1)));
        const c2 = ctrls(el); select(c2, 'True class', z.map((_, i) => [i, 'Class ' + (i + 1)]), truth, v => { truth = +v; draw(); });
        const cv = canvas(el, 640, 200), out = readout(el);
        function draw() {
            const m = Math.max(...z), e = z.map(v => Math.exp(v - m)), s = e.reduce((a, b) => a + b), p = e.map(v => v / s), best = p.indexOf(Math.max(...p));
            cv.clear(); const A = axes(cv, [0, 5], [0, 1], { xt: [], m: { b: 30 } }); const ctx = cv.ctx, bw = (A.X(1) - A.X(0)) * .6;
            p.forEach((v, i) => { const x = A.X(i + .5) - bw / 2; ctx.fillStyle = i === truth ? '#059669' : i === best ? css('c') : css('line-2'); ctx.fillRect(x, A.Y(v), bw, A.Y(0) - A.Y(v)); text(ctx, (v * 100).toFixed(1) + '%', A.X(i + .5), A.Y(v) - 5, css('ink'), 'center', 12, 700); text(ctx, 'Class ' + (i + 1), A.X(i + .5), cv.h - 10, css('muted'), 'center', 11, 600); });
            out.textContent = `Σ p = ${fx(p.reduce((a, b) => a + b), 6)}   predicted: Class ${best + 1}   cross-entropy loss = −ln p(true) = ${fx(-Math.log(p[truth]), 4)}`;
        }
        draw();
    };
})();
