import { H as Hls } from './hls-vendor.js';

function setupPlayer(player) {
  const video = player.querySelector('video[data-src]');
  const button = player.querySelector('[data-play-button]');
  const message = player.querySelector('[data-player-message]');

  if (!video) {
    return;
  }

  const sourceUrl = video.dataset.src;
  let hls = null;
  let prepared = false;

  function setMessage(text) {
    if (message) {
      message.textContent = text || '';
    }
  }

  function prepareSource() {
    if (prepared || !sourceUrl) {
      return;
    }

    prepared = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
      return;
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, function (_event, data) {
        if (data && data.fatal) {
          setMessage('播放源暂时无法载入，请稍后重试或切换浏览器。');
        }
      });
      return;
    }

    setMessage('当前浏览器不支持 HLS 播放，请使用支持 m3u8 的浏览器访问。');
  }

  async function playVideo() {
    prepareSource();

    try {
      await video.play();
      if (button) {
        button.classList.add('hidden');
      }
      setMessage('');
    } catch (error) {
      setMessage('浏览器需要再次点击确认播放。');
    }
  }

  prepareSource();

  if (button) {
    button.addEventListener('click', playVideo);
  }

  video.addEventListener('play', function () {
    if (button) {
      button.classList.add('hidden');
    }
  });

  video.addEventListener('pause', function () {
    if (button && video.currentTime === 0) {
      button.classList.remove('hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}

document.querySelectorAll('[data-player]').forEach(setupPlayer);
