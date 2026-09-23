
const params = new URLSearchParams(location.search);
const id = params.get("id");

const escapeHtml = (s="") => String(s).replace(/[&<>"']/g, c => ({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
}[c]));

const projectHref = (p) => p.page || `project.html?id=${encodeURIComponent(p.id)}`;

fetch("projects.json")
  .then(r => { if(!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
  .then(projects => {
    const p = projects.find(x => x.id === id) || projects[0];
    document.title = `${p.title} — Portfolio`;
    document.querySelector("#project").innerHTML = `
      <div class="breadcrumb"><a href="index.html">← All projects</a></div>
      <section class="project-hero">
        <div class="project-kicker"><span>${escapeHtml(p.category)}</span><span>•</span><span>${p.year}</span></div>
        <h1>${escapeHtml(p.title)}</h1>
        <p class="project-lede">${escapeHtml(p.summary)}</p>
      </section>

      <div class="project-cover">
        <img src="${p.image}" alt="${escapeHtml(p.title)} project cover">
      </div>

      <div class="project-content">
        <aside class="project-facts">
          <div class="fact"><span class="fact-label">Category</span><span class="fact-value">${escapeHtml(p.category)}</span></div>
          <div class="fact"><span class="fact-label">Role</span><span class="fact-value">${escapeHtml(p.role)}</span></div>
          <div class="fact"><span class="fact-label">Location</span><span class="fact-value">${escapeHtml(p.location)}</span></div>
          <div class="fact"><span class="fact-label">Year</span><span class="fact-value">${p.year}</span></div>
          <div class="fact"><span class="fact-label">Capabilities</span><div class="tags fact-tags">${p.capabilities.map(t=>`<span class="tag">${escapeHtml(t)}</span>`).join("")}</div></div>
        </aside>

        <article class="project-story">
          <section>
            <h2>Challenge</h2>
            <p>${escapeHtml(p.challenge)}</p>
          </section>
          <section>
            <h2>Approach</h2>
            <p>${escapeHtml(p.approach)}</p>
          </section>
          <section>
            <h2>Outcome</h2>
            <p>${escapeHtml(p.outcome)}</p>
          </section>

          <section>
            <h2>Selected work</h2>
            <div class="gallery">
              <div class="gallery-card">Replace with plan, diagram, rendering, or spread.</div>
              <div class="gallery-card">Replace with a second project image or detail.</div>
              <div class="gallery-card">Replace with process diagram, map, or before/after.</div>
              <div class="gallery-card">Replace with implementation, writing, or information-design sample.</div>
            </div>
          </section>
        </article>
      </div>

      <section class="related">
        <h2>Related projects</h2>
        <div class="related-grid">
          ${projects.filter(x => x.id !== p.id).sort((a,b) => {
            const ac = a.category === p.category ? -1 : 0;
            const bc = b.category === p.category ? -1 : 0;
            return ac - bc || a.featured-b.featured;
          }).slice(0,3).map(x => `
            <a class="related-card" href="${projectHref(x)}">
              <img src="${x.image}" alt="${escapeHtml(x.title)}">
              <div><strong>${escapeHtml(x.title)}</strong><span>${escapeHtml(x.category)}</span></div>
            </a>
          `).join("")}
        </div>
      </section>`;
  })
  .catch(() => {
    document.querySelector("#project").innerHTML = `<div class="project-error"><h1>Project unavailable</h1><p>The project data could not be loaded.</p><p><a href="index.html">← Return to all projects</a></p></div>`;
  });
