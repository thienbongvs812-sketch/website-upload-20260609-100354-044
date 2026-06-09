(function () {
  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var thumbs = Array.prototype.slice.call(slider.querySelectorAll('[data-slide-index]'));
    if (slides.length <= 1) {
      return;
    }
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      thumbs.forEach(function (thumb, thumbIndex) {
        thumb.classList.toggle('is-active', thumbIndex === active);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5600);
    }

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        show(Number(thumb.getAttribute('data-slide-index')) || 0);
        start();
      });
    });
    start();
  }

  function initFilters() {
    var container = document.querySelector('[data-card-container]');
    if (!container) {
      return;
    }
    var input = document.querySelector('[data-filter-input]');
    var regionSelect = document.querySelector('[data-filter-select="region"]');
    var typeSelect = document.querySelector('[data-filter-select="type"]');
    var yearSelect = document.querySelector('[data-filter-select="year"]');
    var sortSelect = document.querySelector('[data-sort-select]');
    var emptyState = document.querySelector('[data-empty-state]');
    var cards = Array.prototype.slice.call(container.querySelectorAll('.movie-card'));
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');

    if (query && input) {
      input.value = query;
    }

    function cardText(card) {
      return normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-category')
      ].join(' '));
    }

    function compareCards(a, b, mode) {
      var yearA = Number(a.getAttribute('data-year')) || 0;
      var yearB = Number(b.getAttribute('data-year')) || 0;
      var titleA = a.getAttribute('data-title') || '';
      var titleB = b.getAttribute('data-title') || '';
      if (mode === 'year-asc') {
        return yearA - yearB || titleA.localeCompare(titleB, 'zh-Hans-CN');
      }
      if (mode === 'title-asc') {
        return titleA.localeCompare(titleB, 'zh-Hans-CN') || yearB - yearA;
      }
      return yearB - yearA || titleA.localeCompare(titleB, 'zh-Hans-CN');
    }

    function applySort() {
      var mode = sortSelect ? sortSelect.value : 'year-desc';
      cards.sort(function (a, b) {
        return compareCards(a, b, mode);
      });
      cards.forEach(function (card) {
        container.appendChild(card);
      });
    }

    function applyFilter() {
      var q = normalize(input ? input.value : '');
      var region = normalize(regionSelect ? regionSelect.value : '');
      var type = normalize(typeSelect ? typeSelect.value : '');
      var year = normalize(yearSelect ? yearSelect.value : '');
      var visibleCount = 0;

      cards.forEach(function (card) {
        var text = cardText(card);
        var cardRegion = normalize(card.getAttribute('data-region'));
        var cardType = normalize(card.getAttribute('data-type'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var matched = true;

        if (q && text.indexOf(q) === -1) {
          matched = false;
        }
        if (region && cardRegion !== region) {
          matched = false;
        }
        if (type && cardType !== type) {
          matched = false;
        }
        if (year && cardYear !== year) {
          matched = false;
        }

        card.hidden = !matched;
        if (matched) {
          visibleCount += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visibleCount === 0);
      }
    }

    [input, regionSelect, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
    if (sortSelect) {
      sortSelect.addEventListener('change', function () {
        applySort();
        applyFilter();
      });
    }
    applySort();
    applyFilter();
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (wrap) {
      var video = wrap.querySelector('video');
      var button = wrap.querySelector('[data-play-button]');
      if (!video) {
        return;
      }
      var source = video.getAttribute('data-src');
      var ready = false;
      var hlsInstance = null;

      function attachSource() {
        if (ready || !source) {
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          ready = true;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          ready = true;
          return;
        }
        video.src = source;
        ready = true;
      }

      function playVideo() {
        attachSource();
        wrap.classList.add('is-playing');
        var result = video.play();
        if (result && typeof result.catch === 'function') {
          result.catch(function () {
            video.controls = true;
          });
        }
      }

      if (button) {
        button.addEventListener('click', playVideo);
      }
      video.addEventListener('play', function () {
        wrap.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime === 0) {
          wrap.classList.remove('is-playing');
        }
      });
      video.addEventListener('error', function () {
        wrap.classList.add('has-error');
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHeroSlider();
    initFilters();
    initPlayers();
  });
})();
