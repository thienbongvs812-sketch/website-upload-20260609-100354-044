(function () {
    var navToggle = document.querySelector("[data-nav-toggle]");
    var navMenu = document.querySelector("[data-nav-menu]");

    if (navToggle && navMenu) {
        navToggle.addEventListener("click", function () {
            navMenu.classList.toggle("is-open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var currentSlide = 0;
    var heroTimer = null;

    function setHeroSlide(index) {
        if (!slides.length) {
            return;
        }

        currentSlide = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === currentSlide);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === currentSlide);
        });
    }

    function startHero() {
        if (slides.length <= 1) {
            return;
        }

        window.clearInterval(heroTimer);
        heroTimer = window.setInterval(function () {
            setHeroSlide(currentSlide + 1);
        }, 5600);
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            setHeroSlide(index);
            startHero();
        });
    });

    startHero();

    var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-button]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card='movie']"));
    var emptyState = document.querySelector("[data-empty-state]");

    function textOfCard(card) {
        return [
            card.getAttribute("data-card-title") || "",
            card.getAttribute("data-card-meta") || "",
            card.getAttribute("data-card-genre") || "",
            card.getAttribute("data-card-region") || ""
        ].join(" ").toLowerCase();
    }

    filterButtons.forEach(function (button, index) {
        if (index === 0) {
            button.classList.add("is-active");
        }

        button.addEventListener("click", function () {
            var raw = button.getAttribute("data-filter-button") || "all";
            var keys = raw.toLowerCase().split(/\s+/).filter(Boolean);
            var visible = 0;

            filterButtons.forEach(function (item) {
                item.classList.remove("is-active");
            });

            button.classList.add("is-active");

            cards.forEach(function (card) {
                var text = textOfCard(card);
                var matched = raw === "all" || keys.some(function (key) {
                    return text.indexOf(key) !== -1;
                });

                card.hidden = !matched;

                if (matched) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle("is-open", visible === 0);
            }
        });
    });

    var searchForms = Array.prototype.slice.call(document.querySelectorAll("[data-search-form]"));

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>"']/g, function (character) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;",
                "'": "&#39;"
            }[character];
        });
    }

    function resultTemplate(item) {
        return "<a href=\"" + escapeHtml(item.url) + "\"><strong>" + escapeHtml(item.title) + "</strong><small>" + escapeHtml(item.meta) + "</small></a>";
    }

    searchForms.forEach(function (form) {
        var input = form.querySelector("[data-search-input]");
        var box = form.querySelector("[data-search-results]");

        if (!input || !box) {
            return;
        }

        function render() {
            var value = normalize(input.value);
            var list = Array.isArray(window.SITE_SEARCH_INDEX) ? window.SITE_SEARCH_INDEX : [];

            if (!value) {
                box.classList.remove("is-open");
                box.innerHTML = "";
                return;
            }

            var found = list.filter(function (item) {
                return normalize(item.title + " " + item.meta).indexOf(value) !== -1;
            }).slice(0, 8);

            if (!found.length) {
                box.innerHTML = "<span>没有找到匹配的影片</span>";
            } else {
                box.innerHTML = found.map(resultTemplate).join("");
            }

            box.classList.add("is-open");
        }

        input.addEventListener("input", render);
        input.addEventListener("focus", render);

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var first = box.querySelector("a");

            if (first) {
                window.location.href = first.getAttribute("href");
            } else {
                render();
            }
        });

        document.addEventListener("click", function (event) {
            if (!form.contains(event.target)) {
                box.classList.remove("is-open");
            }
        });
    });

    window.initializePlayer = function (videoId, buttonId, streamUrl) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        var started = false;

        if (!video || !button || !streamUrl) {
            return;
        }

        function hideButton() {
            button.classList.add("is-hidden");
        }

        function attach() {
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                return;
            }

            video.src = streamUrl;
        }

        function play() {
            if (!started) {
                attach();
                started = true;
            }

            hideButton();

            var promise = video.play();

            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    button.classList.remove("is-hidden");
                });
            }
        }

        button.addEventListener("click", play);
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener("play", hideButton);
    };
})();
