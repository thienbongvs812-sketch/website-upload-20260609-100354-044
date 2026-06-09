(function () {
    function attachPlayer(shell) {
        var video = shell.querySelector('video');
        var cover = shell.querySelector('.player-cover');
        var source = shell.getAttribute('data-src');
        var hls = null;
        var started = false;

        if (!video || !source) {
            return;
        }

        function load() {
            if (started) {
                return;
            }

            started = true;

            if (cover) {
                cover.classList.add('is-hidden');
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }

            video.controls = true;
            var play = video.play();

            if (play && typeof play.catch === 'function') {
                play.catch(function () {
                    video.controls = true;
                });
            }
        }

        if (cover) {
            cover.addEventListener('click', load);
        }

        video.addEventListener('click', function () {
            if (!started) {
                load();
            }
        });

        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    }

    document.querySelectorAll('[data-player]').forEach(attachPlayer);
}());
