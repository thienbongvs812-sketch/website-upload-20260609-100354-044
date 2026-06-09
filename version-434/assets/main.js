(function () {
  const body = document.body;
  const mobileToggle = document.querySelector('[data-mobile-toggle]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  const searchPanel = document.querySelector('[data-search-panel]');
  const searchInput = document.querySelector('[data-search-input]');
  const searchResults = document.querySelector('[data-search-results]');
  const searchOpeners = document.querySelectorAll('[data-search-open]');
  const searchClose = document.querySelector('[data-search-close]');
  const searchItems = window.SEARCH_INDEX || [];

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function openSearch() {
    if (!searchPanel) {
      return;
    }
    searchPanel.classList.add('is-open');
    searchPanel.setAttribute('aria-hidden', 'false');
    body.classList.add('search-open');
    if (searchInput) {
      searchInput.focus();
      renderSearch(searchInput.value);
    }
  }

  function closeSearch() {
    if (!searchPanel) {
      return;
    }
    searchPanel.classList.remove('is-open');
    searchPanel.setAttribute('aria-hidden', 'true');
    body.classList.remove('search-open');
  }

  function resultTemplate(item) {
    return [
      '<a class="search-result" href="' + item.url + '">',
      '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" onerror="this.classList.add(\'is-hidden\')">',
      '<span>',
      '<h3>' + escapeHtml(item.title) + '</h3>',
      '<p>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.type + ' · ' + item.genre) + '</p>',
      '</span>',
      '</a>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderSearch(query) {
    if (!searchResults) {
      return;
    }

    const term = normalize(query);
    if (!term) {
      searchResults.innerHTML = '<p class="movie-meta">输入片名、地区、年份、类型或标签开始搜索。</p>';
      return;
    }

    const matches = searchItems
      .filter(function (item) {
        return normalize(item.text).indexOf(term) !== -1;
      })
      .slice(0, 16);

    if (!matches.length) {
      searchResults.innerHTML = '<p class="movie-meta">没有找到匹配内容。</p>';
      return;
    }

    searchResults.innerHTML = matches.map(resultTemplate).join('');
  }

  searchOpeners.forEach(function (button) {
    button.addEventListener('click', openSearch);
  });

  if (searchClose) {
    searchClose.addEventListener('click', closeSearch);
  }

  if (searchPanel) {
    searchPanel.addEventListener('click', function (event) {
      if (event.target === searchPanel) {
        closeSearch();
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      renderSearch(searchInput.value);
    });
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeSearch();
    }
  });

  const slider = document.querySelector('[data-hero-slider]');
  if (slider) {
    const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
    const prev = slider.querySelector('[data-hero-prev]');
    const next = slider.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startTimer();
      });
    });

    slider.addEventListener('mouseenter', stopTimer);
    slider.addEventListener('mouseleave', startTimer);
    showSlide(0);
    startTimer();
  }

  const filterPanel = document.querySelector('[data-filter-panel]');
  if (filterPanel) {
    const input = filterPanel.querySelector('[data-filter-input]');
    const regionSelect = filterPanel.querySelector('[data-filter-region]');
    const typeSelect = filterPanel.querySelector('[data-filter-type]');
    const yearSelect = filterPanel.querySelector('[data-filter-year]');
    const cards = Array.from(document.querySelectorAll('.movie-card[data-title], .rank-row[data-title]'));

    function fillSelect(select, values) {
      if (!select) {
        return;
      }
      Array.from(values)
        .filter(Boolean)
        .sort()
        .forEach(function (value) {
          const option = document.createElement('option');
          option.value = value;
          option.textContent = value;
          select.appendChild(option);
        });
    }

    fillSelect(regionSelect, new Set(cards.map(function (card) {
      return card.dataset.region;
    })));

    fillSelect(typeSelect, new Set(cards.map(function (card) {
      return card.dataset.type;
    })));

    fillSelect(yearSelect, new Set(cards.map(function (card) {
      return card.dataset.year;
    })));

    function applyFilters() {
      const query = normalize(input ? input.value : '');
      const region = regionSelect ? regionSelect.value : '';
      const type = typeSelect ? typeSelect.value : '';
      const year = yearSelect ? yearSelect.value : '';

      cards.forEach(function (card) {
        const text = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags
        ].join(' '));
        const matched = (!query || text.indexOf(query) !== -1)
          && (!region || card.dataset.region === region)
          && (!type || card.dataset.type === type)
          && (!year || card.dataset.year === year);
        card.classList.toggle('is-filtered', !matched);
      });
    }

    [input, regionSelect, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });
  }
})();
