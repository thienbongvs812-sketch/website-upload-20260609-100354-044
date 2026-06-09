(function () {
  const mobileButton = document.querySelector('[data-mobile-menu-button]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (mobileButton && mobilePanel) {
    mobileButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero-carousel]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const previous = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    const show = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    const start = function () {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    };

    if (slides.length > 1) {
      previous && previous.addEventListener('click', function () {
        show(current - 1);
        start();
      });
      next && next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
      dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
          show(index);
          start();
        });
      });
      start();
    }
  }

  const filterRoot = document.querySelector('[data-filter-root]');

  if (filterRoot) {
    const search = filterRoot.querySelector('[data-filter-search]');
    const type = filterRoot.querySelector('[data-filter-type]');
    const year = filterRoot.querySelector('[data-filter-year]');
    const cards = Array.from(filterRoot.querySelectorAll('[data-card]'));
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') || '';

    if (search && initialQuery) {
      search.value = initialQuery;
    }

    const applyFilters = function () {
      const query = search ? search.value.trim().toLowerCase() : '';
      const typeValue = type ? type.value : '';
      const yearValue = year ? year.value : '';

      cards.forEach(function (card) {
        const haystack = [
          card.dataset.title || '',
          card.dataset.region || '',
          card.dataset.type || '',
          card.dataset.tags || '',
          card.dataset.year || ''
        ].join(' ').toLowerCase();
        const matchesQuery = !query || haystack.includes(query);
        const matchesType = !typeValue || card.dataset.type === typeValue;
        const matchesYear = !yearValue || card.dataset.year === yearValue;
        card.classList.toggle('filtered-out', !(matchesQuery && matchesType && matchesYear));
      });
    };

    [search, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }
})();
