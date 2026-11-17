# Machine Learning Study Hub (TEB3123)

A static study website covering Chapters 1–8 (Lectures 1–10): guided lessons with interactive visuals, full revision notes, subjective model answers, worked calculations, a formula sheet, common confusions and an MCQ simulator.

## Open it
Double-click `index.html`. It works straight from the folder; there's no build step and no server is needed. An internet connection is needed for the fonts and the KaTeX math renderer.

## Put it online (GitHub Pages)
1. Create a GitHub repository and upload the *contents* of this `website` folder.
2. In the repo, go to **Settings → Pages → Deploy from a branch → `main` / root**.
3. The site will be at `https://<your-username>.github.io/<repo-name>/`.

## Where things live
| File | What it holds |
|---|---|
| `assets/js/content/ch1.js` … `ch8.js` | Lessons, notes, subjective Q&A and MCQs for each chapter |
| `assets/js/content/global.js` | Cheat sheet, formulas, confusions, worked calculations, test strategy |
| `assets/js/visuals.js` | Interactive widgets (`<div class="vis" data-vis="name">` in lessons) |
| `assets/js/app.js` | Navigation, progress tracking and the quiz engine |
| `assets/css/main.css` | Styling (light and dark themes) |

To add an MCQ, append `{ q: 'Question', o: ['A', 'B', 'C', 'D'], a: <index of correct option>, e: 'Explanation' }` to a chapter's `mcq` list.

Progress (learned topics, scores, mistake bank, drafts) is stored in the browser's localStorage, so it is per device and per browser.
