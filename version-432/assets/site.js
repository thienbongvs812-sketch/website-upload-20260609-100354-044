(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-menu-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var next = hero.querySelector("[data-hero-next]");
        var prev = hero.querySelector("[data-hero-prev]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });
        show(0);
        restart();
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
        panels.forEach(function (panel) {
            var scope = panel.closest("section") || document;
            var grid = scope.querySelector("[data-card-grid]");
            if (!grid) {
                grid = document.querySelector("[data-card-grid]");
            }
            if (!grid) {
                return;
            }
            var search = panel.querySelector("[data-local-search]");
            var genre = panel.querySelector("[data-genre-filter]");
            var sort = panel.querySelector("[data-sort-select]");
            var count = panel.querySelector("[data-result-count]");
            var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

            function applyQueryFromUrl() {
                if (!search) {
                    return;
                }
                var params = new URLSearchParams(window.location.search);
                var q = params.get("q");
                if (q) {
                    search.value = q;
                }
            }

            function cardText(card) {
                return [
                    card.getAttribute("data-title") || "",
                    card.getAttribute("data-region") || "",
                    card.getAttribute("data-genre") || "",
                    card.getAttribute("data-tags") || "",
                    card.getAttribute("data-year") || ""
                ].join(" ").toLowerCase();
            }

            function apply() {
                var keyword = search ? search.value.trim().toLowerCase() : "";
                var genreValue = genre ? genre.value.trim().toLowerCase() : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var text = cardText(card);
                    var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                    var matchGenre = !genreValue || text.indexOf(genreValue) !== -1;
                    var shouldShow = matchKeyword && matchGenre;
                    card.classList.toggle("is-hidden-by-filter", !shouldShow);
                    if (shouldShow) {
                        visible += 1;
                    }
                });
                if (count) {
                    count.textContent = String(visible);
                }
            }

            function reorder() {
                if (!sort) {
                    return;
                }
                var key = sort.value;
                var sorted = cards.slice().sort(function (a, b) {
                    var av = Number(a.getAttribute("data-" + key)) || 0;
                    var bv = Number(b.getAttribute("data-" + key)) || 0;
                    return bv - av;
                });
                sorted.forEach(function (card) {
                    grid.appendChild(card);
                });
            }

            applyQueryFromUrl();
            if (search) {
                search.addEventListener("input", apply);
            }
            if (genre) {
                genre.addEventListener("change", apply);
            }
            if (sort) {
                sort.addEventListener("change", function () {
                    reorder();
                    apply();
                });
            }
            reorder();
            apply();
        });
    }

    function setupTopSearch() {
        var forms = Array.prototype.slice.call(document.querySelectorAll("[data-top-search]"));
        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    window.location.href = "./search.html";
                }
            });
        });
    }

    function setupHls(video, source, message) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            video.load();
            return Promise.resolve();
        }
        return import("./hls-vendor-dru42stk.js").then(function (module) {
            var Hls = module.H;
            if (Hls && Hls.isSupported()) {
                var hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                video.__hls = hls;
                return new Promise(function (resolve) {
                    hls.on(Hls.Events.MANIFEST_PARSED, function () {
                        resolve();
                    });
                    window.setTimeout(resolve, 1200);
                });
            }
            video.src = source;
            video.load();
            return Promise.resolve();
        }).catch(function () {
            video.src = source;
            video.load();
            if (message) {
                message.textContent = "当前网络无法加载视频，请稍后重试。";
                message.classList.add("is-visible");
            }
        });
    }

    function initPlayer(source, videoId, buttonId, messageId) {
        ready(function () {
            var video = document.getElementById(videoId);
            var button = document.getElementById(buttonId);
            var message = document.getElementById(messageId);
            if (!video || !button || !source) {
                return;
            }
            var attached = false;

            function play() {
                button.classList.add("is-hidden");
                var promise = attached ? Promise.resolve() : setupHls(video, source, message);
                attached = true;
                promise.then(function () {
                    var playPromise = video.play();
                    if (playPromise && typeof playPromise.catch === "function") {
                        playPromise.catch(function () {
                            button.classList.remove("is-hidden");
                        });
                    }
                });
            }

            button.addEventListener("click", play);
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener("play", function () {
                button.classList.add("is-hidden");
            });
            video.addEventListener("error", function () {
                if (message) {
                    message.textContent = "当前网络无法加载视频，请稍后重试。";
                    message.classList.add("is-visible");
                }
            });
        });
    }

    window.SitePlayer = {
        init: initPlayer
    };

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupTopSearch();
    });
})();
