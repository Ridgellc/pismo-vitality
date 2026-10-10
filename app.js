// Pismo Vitality redesign: shared behavior
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Mobile menu
  const drawer = $("#drawer");
  $$("[data-open-menu]").forEach(b => b.addEventListener("click", () => { drawer.classList.add("open"); $(".close", drawer).focus(); }));
  $$("[data-close-menu]", drawer).forEach(b => b.addEventListener("click", () => drawer.classList.remove("open")));
  document.addEventListener("keydown", e => { if (e.key === "Escape") drawer.classList.remove("open"); });

  // Appointment request modal (any [data-request] opens it; data-treatment preselects)
  const modal = $("#request");
  const form = $("#request-form");
  $$("[data-request]").forEach(b => b.addEventListener("click", e => {
    e.preventDefault();
    drawer.classList.remove("open");
    form.hidden = false; $("#request-done").hidden = true;
    if (b.dataset.treatment) $("#rq-treatment").value = b.dataset.treatment;
    modal.showModal();
    setTimeout(() => $("#rq-name").focus(), 50);
  }));
  $$("[data-close-request]").forEach(b => b.addEventListener("click", () => modal.close()));
  modal.addEventListener("click", e => { if (e.target === modal) modal.close(); });

  // Forms: this preview isn't connected to email yet, so show the confirmation only.
  $$("form[data-preview-form]").forEach(f => f.addEventListener("submit", e => {
    e.preventDefault();
    if (!f.reportValidity()) return;
    const done = document.getElementById(f.dataset.done);
    const name = (f.querySelector("[name=name]") || {}).value || "";
    const first = name.trim().split(/\s+/)[0];
    $(".done-name", done).textContent = first ? `, ${first}` : "";
    f.hidden = true; done.hidden = false; f.reset();
  }));

  // Home slider
  const slides = $$(".slide"), texts = $$(".slide-text"), dots = $$(".dots button");
  if (slides.length) {
    let i = 0, timer;
    const show = n => {
      i = (n + slides.length) % slides.length;
      slides.forEach((s, k) => s.classList.toggle("active", k === i));
      texts.forEach((t, k) => t.classList.toggle("active", k === i));
      dots.forEach((d, k) => d.setAttribute("aria-current", k === i));
    };
    const play = () => { if (!reduce) { clearInterval(timer); timer = setInterval(() => show(i + 1), 6500); } };
    dots.forEach((d, k) => d.addEventListener("click", () => { show(k); play(); }));
    const slider = $(".slider");
    slider.addEventListener("mouseenter", () => clearInterval(timer));
    slider.addEventListener("mouseleave", play);
    show(0); play();
  }

  // Today's hours
  const today = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][new Date().getDay()];
  $$(".hours tr").forEach(tr => tr.classList.toggle("today", tr.dataset.day === today));

  // Click-to-load YouTube (no tracking until played)
  $$(".video[data-yt]").forEach(v => v.addEventListener("click", () => {
    v.outerHTML = `<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/${v.dataset.yt}?autoplay=1&rel=0" title="${v.dataset.title}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>`;
  }));

  // Gallery filter + lightbox
  const grid = $(".ba-grid");
  if (grid) {
    $$(".tabs button").forEach(t => t.addEventListener("click", () => {
      $$(".tabs button").forEach(x => x.setAttribute("aria-pressed", x === t));
      $$("button", grid).forEach(b => b.hidden = t.dataset.cat !== "all" && b.dataset.cat !== t.dataset.cat);
    }));
  }
  const lb = $("#lightbox");
  if (lb) {
    $$("[data-zoom]").forEach(b => b.addEventListener("click", () => {
      $("img", lb).src = b.dataset.zoom; $("img", lb).alt = $("img", b).alt; lb.showModal();
    }));
    $(".close", lb).addEventListener("click", () => lb.close());
    lb.addEventListener("click", e => { if (e.target === lb || e.target.tagName === "IMG") lb.close(); });
  }

  // Fade sections in as they scroll into view
  if ("IntersectionObserver" in window && !reduce) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .12 });
    $$(".reveal").forEach(el => io.observe(el));
  } else $$(".reveal").forEach(el => el.classList.add("in"));
})();
