(function () {
  const body = document.body;
  const mobileToggle = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.dataset.heroDot || 0));
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  function yearMatches(cardYear, filterYear) {
    if (!filterYear) {
      return true;
    }
    const year = Number(cardYear || 0);
    if (filterYear.includes('-')) {
      const parts = filterYear.split('-').map(Number);
      return year >= parts[0] && year <= parts[1];
    }
    return String(year) === filterYear;
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    const key = scope.dataset.filterScope;
    const list = document.querySelector('[data-filter-list="' + key + '"]');
    if (!list) {
      return;
    }

    const textInput = scope.querySelector('[data-filter-text]');
    const regionSelect = scope.querySelector('[data-filter-region]');
    const typeSelect = scope.querySelector('[data-filter-type]');
    const yearSelect = scope.querySelector('[data-filter-year]');
    const reset = scope.querySelector('[data-filter-reset]');
    const empty = document.querySelector('[data-empty-state]');

    function applyFilter() {
      const query = (textInput && textInput.value ? textInput.value : '').trim().toLowerCase();
      const region = regionSelect ? regionSelect.value : '';
      const type = typeSelect ? typeSelect.value : '';
      const filterYear = yearSelect ? yearSelect.value : '';
      let visibleCount = 0;

      list.querySelectorAll('[data-card]').forEach(function (card) {
        const keywords = (card.dataset.keywords || '').toLowerCase();
        const title = (card.dataset.title || '').toLowerCase();
        const cardRegion = card.dataset.region || '';
        const cardType = card.dataset.type || '';
        const cardYear = card.dataset.year || '';
        const visible = (!query || keywords.includes(query) || title.includes(query)) &&
          (!region || cardRegion === region) &&
          (!type || cardType === type) &&
          yearMatches(cardYear, filterYear);

        card.hidden = !visible;
        if (visible) {
          visibleCount += 1;
        }
      });

      if (empty) {
        empty.hidden = visibleCount !== 0;
      }
    }

    [textInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    if (reset) {
      reset.addEventListener('click', function () {
        if (textInput) {
          textInput.value = '';
        }
        if (regionSelect) {
          regionSelect.value = '';
        }
        if (typeSelect) {
          typeSelect.value = '';
        }
        if (yearSelect) {
          yearSelect.value = '';
        }
        applyFilter();
      });
    }
  });

  const drawer = document.querySelector('[data-search-drawer]');
  const globalInput = document.querySelector('[data-global-search-input]');
  const globalResults = document.querySelector('[data-global-search-results]');

  function openSearch() {
    if (!drawer) {
      return;
    }
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    body.style.overflow = 'hidden';
    window.setTimeout(function () {
      if (globalInput) {
        globalInput.focus();
      }
    }, 30);
  }

  function closeSearch() {
    if (!drawer) {
      return;
    }
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    body.style.overflow = '';
  }

  document.querySelectorAll('[data-open-search]').forEach(function (button) {
    button.addEventListener('click', openSearch);
  });

  document.querySelectorAll('[data-close-search]').forEach(function (button) {
    button.addEventListener('click', closeSearch);
  });

  if (drawer) {
    drawer.addEventListener('click', function (event) {
      if (event.target === drawer) {
        closeSearch();
      }
    });
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeSearch();
    }
  });

  function renderGlobalResults(query) {
    if (!globalResults) {
      return;
    }
    const movies = window.MOVIE_DATA || [];
    const text = query.trim().toLowerCase();

    if (!text) {
      globalResults.innerHTML = '<p class="empty-state">请输入关键词开始搜索。</p>';
      return;
    }

    const matches = movies.filter(function (movie) {
      return movie.searchText.includes(text);
    }).slice(0, 24);

    if (!matches.length) {
      globalResults.innerHTML = '<p class="empty-state">没有找到匹配的影片。</p>';
      return;
    }

    globalResults.innerHTML = matches.map(function (movie) {
      return '<a class="search-result-item" href="' + movie.url + '">' +
        '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '封面" loading="lazy">' +
        '<span><strong>' + escapeHtml(movie.title) + '</strong><em>' + escapeHtml(movie.year + ' · ' + movie.region + ' · ' + movie.type) + '</em></span>' +
        '<span class="btn btn-outline">详情</span>' +
      '</a>';
    }).join('');
  }

  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[char];
    });
  }

  if (globalInput) {
    globalInput.addEventListener('input', function () {
      renderGlobalResults(globalInput.value);
    });
    renderGlobalResults('');
  }
})();
