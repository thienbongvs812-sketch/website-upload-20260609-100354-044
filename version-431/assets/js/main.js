(function () {
  const menuButton = document.querySelector(".menu-toggle");
  const mobilePanel = document.querySelector(".mobile-panel");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      const expanded = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!expanded));
      mobilePanel.hidden = expanded;
    });
  }

  const sliders = document.querySelectorAll("[data-hero-slider]");

  sliders.forEach(function (slider) {
    const slides = Array.from(slider.querySelectorAll(".hero-slide"));
    const dots = Array.from(slider.querySelectorAll(".hero-dot"));
    let current = 0;
    let timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        const index = Number(dot.getAttribute("data-slide") || 0);
        show(index);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  });

  const url = new URL(window.location.href);
  const queryValue = url.searchParams.get("q") || "";
  const filterSections = document.querySelectorAll(".filter-section");

  filterSections.forEach(function (section) {
    const keyword = section.querySelector(".filter-keyword");
    const region = section.querySelector(".filter-region");
    const type = section.querySelector(".filter-type");
    const year = section.querySelector(".filter-year");
    const category = section.querySelector(".filter-category");
    const cards = Array.from(section.querySelectorAll(".movie-card"));
    const empty = section.querySelector(".empty-result");

    if (keyword && queryValue) {
      keyword.value = queryValue;
    }

    function matches(card) {
      const q = keyword ? keyword.value.trim().toLowerCase() : "";
      const cardText = (card.getAttribute("data-search") || "").toLowerCase();
      const regionValue = region ? region.value : "";
      const typeValue = type ? type.value : "";
      const yearValue = year ? year.value : "";
      const categoryValue = category ? category.value : "";

      if (q && !cardText.includes(q)) {
        return false;
      }

      if (regionValue && card.getAttribute("data-region") !== regionValue) {
        return false;
      }

      if (typeValue && card.getAttribute("data-type") !== typeValue) {
        return false;
      }

      if (yearValue && card.getAttribute("data-year") !== yearValue) {
        return false;
      }

      if (categoryValue && card.getAttribute("data-category") !== categoryValue) {
        return false;
      }

      return true;
    }

    function update() {
      let shown = 0;

      cards.forEach(function (card) {
        const visible = matches(card);
        card.classList.toggle("is-filter-hidden", !visible);
        if (visible) {
          shown += 1;
        }
      });

      if (empty) {
        empty.hidden = shown > 0;
      }
    }

    [keyword, region, type, year, category].forEach(function (control) {
      if (control) {
        control.addEventListener("input", update);
        control.addEventListener("change", update);
      }
    });

    update();
  });
})();
