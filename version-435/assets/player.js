import { H as Hls } from './hls-vendor.js';

export function startMoviePlayer(source) {
  const video = document.getElementById('movieVideo');
  const overlay = document.getElementById('moviePlayerOverlay');
  const button = document.getElementById('moviePlayButton');

  if (!video || !source) {
    return;
  }

  let attached = false;

  const attachSource = function () {
    if (attached) {
      return;
    }

    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (Hls && Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true });
      hls.loadSource(source);
      hls.attachMedia(video);
      return;
    }

    video.src = source;
  };

  const begin = function () {
    attachSource();

    if (overlay) {
      overlay.classList.add('is-hidden');
    }

    const playback = video.play();

    if (playback && typeof playback.catch === 'function') {
      playback.catch(function () {});
    }
  };

  attachSource();

  if (button) {
    button.addEventListener('click', begin);
  }

  if (overlay) {
    overlay.addEventListener('click', begin);
  }

  video.addEventListener('play', function () {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  });
}
