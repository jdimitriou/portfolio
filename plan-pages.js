document.documentElement.classList.add("js");

document.addEventListener("DOMContentLoaded", () => {
  // Shared project image viewer
  const viewerImg = document.getElementById("viewerImg");
  const viewerCaption = document.getElementById("viewerCaption");
  const viewerButtons = [
    ...document.querySelectorAll("#levelBtns button[data-viewer-src]"),
  ];

  if (viewerImg && viewerCaption && viewerButtons.length) {
    const projectName =
      document.querySelector("h1")?.textContent.trim() || document.title || "Project";

    const showView = (button) => {
      const src = button.dataset.viewerSrc;
      const caption = button.dataset.viewerCaption || button.textContent.trim();
      const alt =
        button.dataset.viewerAlt ||
        `${projectName} — ${button.textContent.trim()}`;

      if (!src) return;

      viewerImg.src = src;
      viewerImg.alt = alt;
      viewerCaption.textContent = caption;

      viewerButtons.forEach((btn) => {
        const active = btn === button;
        btn.classList.toggle("active", active);
        btn.setAttribute("aria-pressed", active ? "true" : "false");
      });
    };

    viewerButtons.forEach((button) => {
      button.addEventListener("click", () => showView(button));
    });
  }

  // Map tabs
  const tabs = [...document.querySelectorAll(".map-tab")];
  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabs.forEach((b) => b.setAttribute("aria-selected", "false"));
      btn.setAttribute("aria-selected", "true");

      document.querySelectorAll(".map-pane").forEach((pane) => {
        pane.classList.toggle("active", pane.id === btn.dataset.target);
      });
    });
  });

  // Fade-in behavior
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );

    document.querySelectorAll(".fade").forEach((el) => observer.observe(el));
  } else {
    document.querySelectorAll(".fade").forEach((el) => el.classList.add("in"));
  }
});

// Shared image zoom.
// Uses event delegation so it also works for images added/changed after page load.
(() => {
  function getModal() {
    let modal = document.querySelector(".image-modal");

    // If a page has zoomable images but no modal markup, create the standard modal.
    if (!modal && document.querySelector(".zoomable")) {
      modal = document.createElement("div");
      modal.id = "image-modal";
      modal.className = "image-modal";
      modal.setAttribute("aria-hidden", "true");
      modal.setAttribute("aria-modal", "true");
      modal.setAttribute("role", "dialog");
      modal.setAttribute("aria-label", "Expanded image");

      const closeButton = document.createElement("button");
      closeButton.type = "button";
      closeButton.setAttribute("aria-label", "Close image");
      closeButton.textContent = "×";

      const modalImg = document.createElement("img");
      modalImg.alt = "Expanded image";

      modal.append(closeButton, modalImg);
      document.body.appendChild(modal);
    }

    return modal;
  }

  function closeModal(modal) {
    if (!modal) return;

    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");

    const modalImg = modal.querySelector("img");
    if (modalImg) modalImg.removeAttribute("src");
  }

  document.addEventListener("click", (event) => {
    const zoomable = event.target.closest("img.zoomable");

    if (zoomable) {
      const modal = getModal();
      if (!modal) return;

      const modalImg = modal.querySelector("img");
      if (!modalImg) return;

      modalImg.src = zoomable.currentSrc || zoomable.src;
      modalImg.alt = zoomable.alt || "Expanded image";

      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
      return;
    }

    const modal = event.target.closest(".image-modal");
    if (!modal) return;

    if (
      event.target === modal ||
      event.target.closest('button[aria-label="Close image"]')
    ) {
      closeModal(modal);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    const modal = document.querySelector(".image-modal.open");

    if (modal && modal.classList.contains("open")) {
      closeModal(modal);
    }
  });
})();
