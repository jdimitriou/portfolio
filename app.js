const state = {
  category: "All",
  capability: "All",
  query: "",
  sort: "featured"
};

let projects = [];

const $ = (sel) => document.querySelector(sel);
const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, ch => ({
  "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
}[ch]));
const projectHref = (p) => p.page || `project.html?id=${encodeURIComponent(p.id)}`;

function cardTemplate(p){
  const href = projectHref(p);
  return `
    <article class="card">
      <a class="card-image" href="${href}" aria-label="View ${escapeHtml(p.title)}">
        <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.title)} project thumbnail">
      </a>
      <div class="card-body">
        <div class="card-meta"><span>${escapeHtml(p.category)}</span><span>${escapeHtml(p.year)}</span></div>
        <h2><a href="${href}">${escapeHtml(p.title)}</a></h2>
        <p>${escapeHtml(p.summary)}</p>
        <div class="tags">${p.capabilities.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join("")}</div>
        <a class="card-link" href="${href}">View project →</a>
      </div>
    </article>`;
}

function render(){
  let list = projects.filter(p => {
    const cat = state.category === "All" || p.category === state.category;
    const cap = state.capability === "All" || p.capabilities.includes(state.capability);
    const q = state.query.trim().toLowerCase();
    const text = [p.title,p.category,p.summary,...p.capabilities].join(" ").toLowerCase();
    return cat && cap && (!q || text.includes(q));
  });

  if(state.sort === "newest") list.sort((a,b) => b.year-a.year || a.featured-b.featured);
  if(state.sort === "az") list.sort((a,b) => a.title.localeCompare(b.title));
  if(state.sort === "featured") list.sort((a,b) => a.featured-b.featured);

  $("#projectGrid").innerHTML = list.map(cardTemplate).join("");
  $("#emptyState").style.display = list.length ? "none" : "block";
  $("#resultCount").textContent = `${list.length} project${list.length === 1 ? "" : "s"}`;
}

function wireFilters(){
  document.querySelectorAll("[data-category]").forEach(btn => {
    btn.addEventListener("click", () => {
      state.category = btn.dataset.category;
      document.querySelectorAll("[data-category]").forEach(b => b.classList.toggle("active", b === btn));
      render();
    });
  });

  document.querySelectorAll("[data-capability]").forEach(btn => {
    btn.addEventListener("click", () => {
      state.capability = btn.dataset.capability;
      document.querySelectorAll("[data-capability]").forEach(b => b.classList.toggle("active", b === btn));
      render();
    });
  });

  $("#searchInput").addEventListener("input", e => { state.query = e.target.value; render(); });
  $("#sortSelect").addEventListener("change", e => { state.sort = e.target.value; render(); });
}

fetch("projects.json")
  .then(r => { if(!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
  .then(data => { projects = data; wireFilters(); render(); })
  .catch(() => {
    $("#emptyState").style.display = "block";
    $("#emptyState").textContent = "Project data could not be loaded.";
  });
