(function () {
  var wrap = document.querySelector('[data-player]');
  if (!wrap) {
    return;
  }
  var video = wrap.querySelector('video');
  var overlay = wrap.querySelector('[data-play-overlay]');
  var sourceElement = video ? video.querySelector('source') : null;
  var source = sourceElement ? sourceElement.getAttribute('src') : '';
  var ready = false;
  var hls = null;

  var bind = function () {
    if (ready || !video || !source) {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
    ready = true;
  };

  var start = function () {
    bind();
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    video.controls = true;
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  };

  if (overlay) {
    overlay.addEventListener('click', start);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (!ready || video.paused) {
        start();
      } else {
        video.pause();
      }
    });
  }

  window.addEventListener('pagehide', function () {
    if (hls && typeof hls.destroy === 'function') {
      hls.destroy();
    }
  });
})();
