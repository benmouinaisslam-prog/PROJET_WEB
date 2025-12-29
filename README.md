# TechStore — Admin Dashboard

Group: 3IIRG4

MEMBRE DU PROJET:
- ISSLAM BEN MOUINA
- AYA REANI

TITLE OF PROJECT: TechStore

## Project Description
TechStore is a single-page admin dashboard built with vanilla HTML, CSS and JavaScript. It provides a lightweight interface to manage users, products and view analytics (charts). Data persistence is handled entirely in the browser using LocalStorage — there is no backend.

This workspace contains the following important files:
- `index.html` — Entry HTML for the SPA (tracked in git).
- `style.css` — Styling for the dashboard (intentionally ignored by `.gitignore`).
- `script/` — JavaScript modules for each tab (intentionally ignored by `.gitignore`).
 - Demo Module 1 — Products CRUD
	 - `module1.html` — Standalone page showing a focused Products CRUD demo for presentation.
	 - `module1.css` — Styles for the demo page.
	 - `module1.js` — JavaScript implementing full CRUD, search, sort, detail view, FakeStoreAPI import and LocalStorage persistence.
Design
 - The site uses a modern vanilla CSS design; Bootstrap was removed per project request. The file `bootstrap-overrides.css` is deprecated and kept empty to avoid accidental usage.
Note about repository contents
- Per project request, the repository is configured to push only `index.html`. The `style.css` and the `script/` folder are ignored by `.gitignore` to prevent them from being pushed.
 - For presenting Module 1, `module1.html`, `module1.css` and `module1.js` are included in the repo so you can push and present only the focused module.
- If you want the full working application to be available in the repository, remove `style.css` and `/script/` from `.gitignore` and commit them.

Running locally
1. Open `index.html` in a browser to view the shell.
2. To use the full client-side functionality (CRUD, charts), make sure the `script/` files and `style.css` are present next to `index.html` locally (they exist in this workspace but are excluded from git by default).

License & notes
- This is a school/project demo. Feel free to adapt and extend. If you want help toggling which files are tracked by git or preparing a commit that includes scripts and styles, I can update the `.gitignore` and stage the files for you.
