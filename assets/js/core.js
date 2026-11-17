/* Core namespace shared by content files, visuals and the app.
   Content files call ML.addChapter({...}); global.js fills ML.global. */
window.ML = {
    chapters: [],
    global: {},
    vis: {},
    addChapter(ch) {
        this.chapters.push(ch);
        this.chapters.sort((a, b) => a.id - b.id);
    },
    chapter(id) { return this.chapters.find(c => c.id === Number(id)); }
};

/* Safe localStorage wrapper: storage can be unavailable (private mode, blocked cookies). */
ML.store = {
    key: 'ml-study-hub-v1',
    _mem: null,
    load() {
        if (this._mem) return this._mem;
        let data = {};
        try { data = JSON.parse(localStorage.getItem(this.key) || '{}') || {}; } catch (e) { data = {}; }
        data.learned = data.learned || {};
        data.quiz = data.quiz || {};
        data.mistakes = data.mistakes || {};
        data.answers = data.answers || {};
        this._mem = data;
        return data;
    },
    save() {
        try { localStorage.setItem(this.key, JSON.stringify(this._mem || {})); } catch (e) { /* ignore */ }
    },
    reset() {
        this._mem = { learned: {}, quiz: {}, mistakes: {}, answers: {} };
        try { localStorage.removeItem(this.key); } catch (e) { /* ignore */ }
    },
    pref(name, value) {
        try {
            if (value === undefined) return localStorage.getItem('ml-pref-' + name);
            localStorage.setItem('ml-pref-' + name, value);
        } catch (e) { return null; }
    }
};
