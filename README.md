# Portfolio Website — Shared Component Styles

This package uses a single authored stylesheet, `styles.css`, for the entire website. The stylesheet is organized as a small shared design system rather than a collection of page-specific body scopes.

## Style architecture

- **No page identity classes on `<body>`**. Selectors such as `body.portfolio-page`, `body.plan-page`, `body.sfcp-page`, `body.lfmp-page`, `body.regulatory-page`, and visualization page body classes have been removed.
- **Shared design tokens** live in one `:root` block (`--bg`, `--paper`, `--text`, `--muted`, `--line`, `--accent`, `--radius`, etc.).
- **Reusable components** are styled directly by their purpose: `.stat-card`, `.media-card`, `.tags`, `.tag`, `.section-head`, `.two-col`, `.form-card`, `.project-cover`, `.project-content`, and so on.
- **Reusable variants** are named for what they do, not which page they belong to. Examples include `.plan-hero`, `.portfolio-hero`, `.site-nav`, `.section-nav`, `.image-modal`, and `.content-section`.
- **Page-specific hero images are content settings**, supplied as CSS custom properties on the hero element itself, rather than being selected from a page body class.
- **Special interactive visualizations** use component roots such as `.compplan-view`, `.workerflow-view`, and `.tickler-view` because their canvas/application interfaces intentionally have different full-screen behavior. Those styles are scoped to the component, not to page identity.

The result is that the same component can be placed on SFCP, LFMP, the regulatory framework, or another page and use the same CSS class and styling without adding a new body selector.

## Main files

- `index.html` — portfolio home
- `project.html` — reusable project detail shell
- `projects.json` — project content / metadata
- `styles.css` — shared design system for all pages
- `app.js` — portfolio filtering/search/sort
- `project.js` — project detail rendering
- `plan-pages.js` — shared map tabs, image modal, and fade behavior
- `south-frederick-corridors-plan.html`
- `livable-frederick-master-plan.html`
- `regulatory-framework.html`
- `virginia_beach_town_square_project.html`
- `vbtc.html`
- `compplandata.html` + `compplandata.js`
- `workerflow.html` + `workerflow.js`
- `tickler_dots.html` + `tickler.js`
- `assets/` — project graphics and documents supplied in the original package

## Existing missing assets

Two references in the supplied website point to files that were not included in the ZIP: `assets/lfmp-hero.jpg` and `assets/program-schedule.pdf`. Their references are preserved so the refactor does not silently substitute different content.

## Running locally

Because the portfolio loads `projects.json`, serve the folder through a local web server rather than opening `index.html` directly:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.
