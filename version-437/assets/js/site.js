(function () {
    var toggle = document.querySelector('[data-nav-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var index = 0;
        var timer = null;

        function showHero(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });

            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }

        function startHero() {
            stopHero();
            timer = window.setInterval(function () {
                showHero(index + 1);
            }, 5600);
        }

        function stopHero() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showHero(Number(dot.getAttribute('data-hero-dot') || '0'));
                startHero();
            });
        });

        hero.addEventListener('mouseenter', stopHero);
        hero.addEventListener('mouseleave', startHero);
        showHero(0);
        startHero();
    }

    document.querySelectorAll('[data-filter-root]').forEach(function (root) {
        var input = root.querySelector('[data-search-input]');
        var category = root.querySelector('[data-category-filter]');
        var type = root.querySelector('[data-type-filter]');
        var reset = root.querySelector('[data-filter-reset]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

        function valueOf(element) {
            return element ? element.value.trim().toLowerCase() : '';
        }

        function cardText(card) {
            return [
                card.getAttribute('data-title'),
                card.getAttribute('data-year'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-tags'),
                card.textContent
            ].join(' ').toLowerCase();
        }

        function filterCards() {
            var q = valueOf(input);
            var categoryValue = valueOf(category);
            var typeValue = valueOf(type);

            cards.forEach(function (card) {
                var text = cardText(card);
                var matchSearch = !q || text.indexOf(q) !== -1;
                var matchCategory = !categoryValue || text.indexOf(categoryValue) !== -1;
                var matchType = !typeValue || text.indexOf(typeValue) !== -1;
                card.hidden = !(matchSearch && matchCategory && matchType);
            });
        }

        [input, category, type].forEach(function (element) {
            if (element) {
                element.addEventListener('input', filterCards);
                element.addEventListener('change', filterCards);
            }
        });

        if (reset) {
            reset.addEventListener('click', function () {
                if (input) {
                    input.value = '';
                }
                if (category) {
                    category.value = '';
                }
                if (type) {
                    type.value = '';
                }
                filterCards();
            });
        }
    });
}());
