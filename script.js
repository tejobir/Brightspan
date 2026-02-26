/* ═══════════════════════════════════════════
   BRIGHTSPAN — Main Script
   Animations, Interactions & Transitions
   ═══════════════════════════════════════════ */

(function () {
    'use strict';

    // ─── Preloader ─────────────────────────────
    const preloader = document.getElementById('preloader');
    const preloaderBar = document.getElementById('preloaderBar');
    const preloaderPercent = document.getElementById('preloaderPercent');
    let loadProgress = 0;

    function updatePreloader() {
        // Vastly speed up the artificial loading progress
        loadProgress += Math.random() * 30 + 15;
        if (loadProgress > 100) loadProgress = 100;

        preloaderBar.style.width = loadProgress + '%';
        preloaderPercent.textContent = Math.round(loadProgress) + '%';

        if (loadProgress < 100) {
            // Reduce the ticking delay to feel extremely fast
            requestAnimationFrame(() => setTimeout(updatePreloader, 15 + Math.random() * 15));
        } else {
            setTimeout(() => {
                preloader.classList.add('hide');
                document.body.classList.add('loaded');
                initScrollAnimations();
            }, 50); // Cut the final fade delay down from 400ms to 50ms
        }
    }

    // Preload key images before showing
    const heroImages = document.querySelectorAll('.stack-card img');
    let imagesLoaded = 0;
    const totalImages = heroImages.length;

    function checkImagesLoaded() {
        imagesLoaded++;
        if (imagesLoaded >= totalImages) {
            // Images are ready, finalize
            if (loadProgress < 80) loadProgress = 80;
        }
    }

    heroImages.forEach(img => {
        if (img.complete) {
            checkImagesLoaded();
        } else {
            img.addEventListener('load', checkImagesLoaded);
            img.addEventListener('error', checkImagesLoaded);
        }
    });

    updatePreloader();

    // ─── Custom Cursor ─────────────────────────
    const cursorDot = document.getElementById('cursorDot');
    const cursorRing = document.getElementById('cursorRing');

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    if (window.matchMedia('(pointer: fine)').matches) {
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            cursorDot.style.left = mouseX + 'px';
            cursorDot.style.top = mouseY + 'px';
        });

        function animateRing() {
            ringX += (mouseX - ringX) * 0.12;
            ringY += (mouseY - ringY) * 0.12;

            cursorRing.style.left = ringX + 'px';
            cursorRing.style.top = ringY + 'px';

            requestAnimationFrame(animateRing);
        }
        animateRing();

        // Hover effect on interactive elements
        const hoverTargets = document.querySelectorAll('a, button, .service-card, .testimonial-card');
        hoverTargets.forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
        });
    }

    // ─── Navigation ────────────────────────────
    const navbar = document.getElementById('navbar');
    const menuBtn = document.getElementById('menuBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    // Scroll effect
    let lastScrollY = 0;
    window.addEventListener('scroll', () => {
        const sy = window.scrollY;
        if (sy > 80) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        lastScrollY = sy;
    }, { passive: true });

    // Mobile menu toggle
    menuBtn.addEventListener('click', () => {
        menuBtn.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close mobile menu on link click
    document.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', () => {
            menuBtn.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // ─── Kinetic Card Deck — Enhanced Cinematic ──────
    const imageStack = document.getElementById('imageStack');
    const cards = Array.from(document.querySelectorAll('.stack-card'));
    const TOTAL = cards.length;

    // Deck state: ordered array of card elements, index 0 = bottom, last = top
    let deck = [...cards];
    let isShuffling = false;
    let shuffleTimer = null;
    let isPaused = false;
    let shuffleCount = 0;

    // Exit direction cycle for dramatic variety
    const exitMoves = [
        { transform: 'translateX(160%) translateY(-80px) rotate(28deg) scale(0.65)', label: 'right' },
        { transform: 'translateX(-160%) translateY(-60px) rotate(-22deg) scale(0.7)', label: 'left' },
        { transform: 'translateY(-220%) translateX(40px) rotate(18deg) scale(0.55)', label: 'up' },
        { transform: 'translateX(130%) translateY(50px) rotate(-30deg) scale(0.6)', label: 'right-down' },
        { transform: 'translateX(-140%) translateY(-100px) rotate(20deg) scale(0.6)', label: 'left-up' },
    ];

    // ── Position configuration for the fanned-out deck ──
    // Each slot from bottom (0) to top (TOTAL-1)
    function getSlotStyle(slotIndex, total) {
        const topSlot = total - 1;
        const depth = topSlot - slotIndex; // 0 = top, bigger = deeper

        // Wider fan spread with 3D depth
        const yOffset = depth * -10;
        const xShift = depth === 0 ? 0 : (depth % 2 === 0 ? -5 : 5) * depth;
        const zOffset = depth * -30; // 3D depth via translateZ
        const scale = 1 - depth * 0.045;

        // More dramatic rotations for a hand-of-cards feel
        const rotations = [0, -4, 3, -6.5, 4.5];
        const rotation = depth === 0 ? 0 : (rotations[depth] || (depth % 2 === 0 ? -3 : 3));

        // Opacity with more contrast between front and back
        const opacity = depth === 0 ? 1 : Math.max(0.25, 1 - depth * 0.18);

        // Depth-of-field: subtle brightness reduction on deeper cards
        const brightness = depth === 0 ? 1 : Math.max(0.6, 1 - depth * 0.1);

        // Shadow: dramatic on top card, subtle on rest
        const shadowConfig = depth === 0
            ? '0 25px 60px rgba(0,0,0,0.5), 0 0 100px rgba(232,70,28,0.06), 0 0 1px rgba(255,255,255,0.1)'
            : `0 ${8 + depth * 2}px ${20 - depth * 3}px rgba(0,0,0,${0.3 - depth * 0.05})`;

        const zIndex = slotIndex + 1;

        return {
            transform: `translateX(${xShift}px) translateY(${yOffset}px) translateZ(${zOffset}px) rotate(${rotation}deg) scale(${scale})`,
            opacity,
            zIndex,
            boxShadow: shadowConfig,
            filter: `brightness(${brightness})`,
        };
    }

    // Apply slot styles to current deck order
    function applyDeckPositions(animate) {
        deck.forEach((card, slotIndex) => {
            const style = getSlotStyle(slotIndex, TOTAL);
            if (!animate) {
                card.style.transition = 'none';
            }
            card.style.transform = style.transform;
            card.style.opacity = style.opacity;
            card.style.zIndex = style.zIndex;
            card.style.boxShadow = style.boxShadow;
            card.style.filter = style.filter;
            if (!animate) {
                card.offsetHeight; // Force reflow
                card.style.transition = '';
            }
        });
    }

    // ── Entrance animation: staggered fan-out from stacked ──
    function entranceFanOut() {
        // Start: all cards stacked tight, invisible
        cards.forEach((card) => {
            card.style.transition = 'none';
            card.style.transform = 'translateY(60px) translateZ(-100px) scale(0.85) rotate(0deg)';
            card.style.opacity = '0';
            card.style.zIndex = '1';
            card.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
            card.style.filter = 'brightness(0.5)';
        });

        imageStack.offsetHeight; // Force reflow

        // Stagger each card into position from bottom to top
        deck.forEach((card, slotIndex) => {
            const style = getSlotStyle(slotIndex, TOTAL);
            const delay = 0.4 + slotIndex * 0.13;

            card.style.transition = `
                transform 1.1s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}s,
                opacity 0.7s ease ${delay}s,
                box-shadow 1s ease ${delay}s,
                filter 0.8s ease ${delay}s
            `;
            card.style.transform = style.transform;
            card.style.opacity = style.opacity;
            card.style.zIndex = style.zIndex;
            card.style.boxShadow = style.boxShadow;
            card.style.filter = style.filter;
        });

        // After entrance completes, reset transitions to default
        setTimeout(() => {
            cards.forEach(card => { card.style.transition = ''; });
        }, 400 + TOTAL * 130 + 1200);
    }

    // ── Kinetic Shuffle: top card sweeps off-screen, rest cascade up ──
    function shuffleDeck() {
        if (isShuffling || isPaused) return;
        isShuffling = true;

        const topCard = deck[TOTAL - 1];
        const exitMove = exitMoves[shuffleCount % exitMoves.length];
        shuffleCount++;

        // Phase 1: Brief lift
        topCard.style.transition = `
            transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1),
            box-shadow 0.15s ease
        `;
        topCard.style.transform = 'translateY(-15px) translateZ(10px) rotate(1deg) scale(1.02)';
        topCard.style.boxShadow = '0 30px 70px rgba(0,0,0,0.5), 0 0 80px rgba(232,70,28,0.08)';
        topCard.style.zIndex = TOTAL + 2;

        // Phase 2: Fast throw off-screen
        setTimeout(() => {
            topCard.style.transition = `
                transform 0.25s cubic-bezier(0.55, 0.06, 0.68, 0.19),
                opacity 0.2s cubic-bezier(0.55, 0.06, 0.68, 0.19),
                filter 0.15s ease,
                box-shadow 0.2s ease
            `;
            topCard.style.transform = exitMove.transform;
            topCard.style.opacity = '0';
            topCard.style.filter = 'brightness(1.3) blur(2px)';
            topCard.style.boxShadow = '0 0 0 rgba(0,0,0,0)';
        }, 80);

        // Phase 3: Cascade remaining cards up
        setTimeout(() => {
            deck.pop();
            deck.unshift(topCard);

            deck.forEach((card, slotIndex) => {
                if (card === topCard) return;
                const style = getSlotStyle(slotIndex, TOTAL);
                card.style.transition = `
                    transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
                    opacity 0.2s ease,
                    box-shadow 0.3s ease,
                    filter 0.2s ease
                `;
                card.style.transform = style.transform;
                card.style.opacity = style.opacity;
                card.style.zIndex = style.zIndex;
                card.style.boxShadow = style.boxShadow;
                card.style.filter = style.filter;
            });
        }, 120);

        // Phase 4: Snap exited card to back
        setTimeout(() => {
            topCard.style.transition = 'none';
            const backStyle = getSlotStyle(0, TOTAL);
            topCard.style.transform = backStyle.transform;
            topCard.style.opacity = backStyle.opacity;
            topCard.style.zIndex = backStyle.zIndex;
            topCard.style.boxShadow = backStyle.boxShadow;
            topCard.style.filter = backStyle.filter;

            topCard.offsetHeight; // Force reflow

            requestAnimationFrame(() => {
                cards.forEach(c => { c.style.transition = ''; });
                isShuffling = false;
            });
        }, 380);
    }

    // ── Start the loop after load ──
    function startShuffleLoop() {
        shuffleTimer = setInterval(() => {
            if (!isPaused) shuffleDeck();
        }, 500);
    }

    // Hook into the loaded event
    const origOnLoad = () => {
        entranceFanOut();
        setTimeout(startShuffleLoop, 400 + TOTAL * 130 + 1600);
    };

    // Wait for body.loaded class
    const loadedObserver = new MutationObserver(() => {
        if (document.body.classList.contains('loaded')) {
            loadedObserver.disconnect();
            origOnLoad();
        }
    });
    loadedObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    // In case already loaded
    if (document.body.classList.contains('loaded')) {
        loadedObserver.disconnect();
        origOnLoad();
    }

    // ── Pause on hover ──
    if (imageStack) {
        imageStack.addEventListener('mouseenter', () => {
            isPaused = true;
        });
        imageStack.addEventListener('mouseleave', () => {
            isPaused = false;
        });
    }

    // ─── Scroll Animations (Intersection Observer) ──
    function initScrollAnimations() {
        const observerOptions = {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        const animTargets = document.querySelectorAll(
            '.services-title, .service-card, .testimonials-title, .cta-title'
        );

        animTargets.forEach((el, i) => {
            el.style.transitionDelay = (i % 4) * 0.1 + 's';
            observer.observe(el);
        });
    }

    // ─── Smooth Parallax on Hero ───────────────
    const heroGlows = document.querySelectorAll('.hero-glow');
    const heroHeadline = document.getElementById('heroHeadline');

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        const heroHeight = window.innerHeight;

        if (scrollY < heroHeight * 1.5) {
            const progress = scrollY / heroHeight;

            heroGlows.forEach((glow, i) => {
                const speed = 0.3 + i * 0.1;
                glow.style.transform = `translateY(${scrollY * speed}px)`;
            });

            if (heroHeadline) {
                heroHeadline.style.transform = `translateY(${scrollY * 0.15}px)`;
                heroHeadline.style.opacity = 1 - progress * 0.6;
            }
        }
    }, { passive: true });

    // ─── Mouse Parallax on Hero Glows ──────────
    if (window.matchMedia('(pointer: fine)').matches) {
        const hero = document.getElementById('heroSection');
        if (hero) {
            hero.addEventListener('mousemove', (e) => {
                const rect = hero.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;

                heroGlows.forEach((glow, i) => {
                    const intensity = 30 + i * 15;
                    glow.style.transform = `translate(${x * intensity}px, ${y * intensity}px)`;
                });

                // Subtle tilt on image stack — don't override deckFloat
                // We apply perspective to the container but let the CSS animation handle its own transform
                if (imageStack) {
                    const tiltX = x * 4;
                    const tiltY = -y * 4;
                    imageStack.style.perspective = '1000px';
                    // Apply subtle shift to each card's existing transform
                    deck.forEach((card, i) => {
                        if (!isShuffling) {
                            const currentTransform = card.style.transform || '';
                            // Only add a tiny perspective rotation as filter
                        }
                    });
                }
            });
        }
    }

    // ─── Magnetic Effect on CTAs ───────────────
    const magneticBtns = document.querySelectorAll('.cta-btn, .cta-main-btn, .view-more-btn');

    if (window.matchMedia('(pointer: fine)').matches) {
        magneticBtns.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px) scale(1.02)`;
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = '';
            });
        });
    }


    // ─── Smooth Counter on Services Section ────
    function animateNumbers() {
        const counters = document.querySelectorAll('.counter-value');
        counters.forEach(counter => {
            const target = parseInt(counter.dataset.target);
            let current = 0;
            const increment = target / 60;

            function step() {
                current += increment;
                if (current >= target) {
                    counter.textContent = target;
                    return;
                }
                counter.textContent = Math.floor(current);
                requestAnimationFrame(step);
            }
            step();
        });
    }

    // ─── Text Scramble Effect for Labels ───────
    const sectionLabels = document.querySelectorAll('.section-label span:last-child');

    const labelObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                scrambleText(entry.target);
                labelObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    sectionLabels.forEach(label => labelObserver.observe(label));

    function scrambleText(el) {
        const originalText = el.textContent;
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let iteration = 0;

        const interval = setInterval(() => {
            el.textContent = originalText
                .split('')
                .map((char, i) => {
                    if (i < iteration) return originalText[i];
                    return chars[Math.floor(Math.random() * 26)];
                })
                .join('');

            if (iteration >= originalText.length) {
                clearInterval(interval);
            }

            iteration += 1 / 2;
        }, 30);
    }

    // ─── Navbar Active Link Highlight ──────────
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 200;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });
    }, { passive: true });

    // ═══════════════════════════════════════════
    // STAGGER TESTIMONIALS
    // ═══════════════════════════════════════════
    (function initStaggerTestimonials() {
        const container = document.getElementById('staggerTestimonials');
        if (!container) return;

        const testimonials = [
            { testimonial: "Content will be updated here soon.", by: "TBN", img: "https://i.pravatar.cc/150?img=50" },
            { testimonial: "Content will be updated here soon.", by: "TBN", img: "https://i.pravatar.cc/150?img=51" },
            { testimonial: "Content will be updated here soon.", by: "TBN", img: "https://i.pravatar.cc/150?img=52" },
            { testimonial: "Content will be updated here soon.", by: "TBN", img: "https://i.pravatar.cc/150?img=53" },
            { testimonial: "Content will be updated here soon.", by: "TBN", img: "https://i.pravatar.cc/150?img=54" },
            { testimonial: "Content will be updated here soon.", by: "TBN", img: "https://i.pravatar.cc/150?img=55" }
        ];

        let list = testimonials.map((t, i) => ({ ...t, _id: i }));
        let cardSize = window.matchMedia("(min-width: 640px)").matches ? 365 : 290;
        let cardElements = [];

        function getCardSize() {
            return window.matchMedia("(min-width: 640px)").matches ? 365 : 290;
        }

        function createCardEl(item) {
            const el = document.createElement('div');
            el.className = 'stagger-card';
            el.style.width = cardSize + 'px';
            el.style.height = cardSize + 'px';
            el.innerHTML = `
                <span class="stagger-card-corner"></span>
                <h3 class="stagger-card-quote">"${item.testimonial}"</h3>
                <p class="stagger-card-by">- ${item.by}</p>
            `;
            return el;
        }

        function positionCards() {
            const total = list.length;
            const half = total % 2 === 0 ? total / 2 : (total + 1) / 2;

            cardElements.forEach((el, index) => {
                const position = total % 2 === 0
                    ? index - total / 2
                    : index - (total + 1) / 2;

                const isCenter = position === 0;
                const xOffset = (cardSize / 1.5) * position;
                const yOffset = isCenter ? -65 : (position % 2 ? 15 : -15);
                const rotation = isCenter ? 0 : (position % 2 ? 2.5 : -2.5);

                el.style.transform = `translate(-50%, -50%) translateX(${xOffset}px) translateY(${yOffset}px) rotate(${rotation}deg)`;

                if (isCenter) {
                    el.classList.add('is-active');
                    el.style.zIndex = 10;
                    el.style.boxShadow = '0px 8px 0px 4px rgba(255,255,255,0.1)';
                } else {
                    el.classList.remove('is-active');
                    el.style.zIndex = Math.max(0, 10 - Math.abs(position));
                    el.style.boxShadow = '0px 0px 0px 0px transparent';
                }
            });
        }

        function handleMove(steps) {
            const newList = [...list];
            if (steps > 0) {
                for (let i = 0; i < steps; i++) {
                    const item = newList.shift();
                    if (item) newList.push({ ...item, _id: Math.random() });
                }
            } else {
                for (let i = 0; i < Math.abs(steps); i++) {
                    const item = newList.pop();
                    if (item) newList.unshift({ ...item, _id: Math.random() });
                }
            }
            list = newList;
            render();
        }

        function render() {
            // Remove old cards
            cardElements.forEach(el => el.remove());
            cardElements = [];

            // Create new cards
            list.forEach((item, index) => {
                const total = list.length;
                const position = total % 2 === 0
                    ? index - total / 2
                    : index - (total + 1) / 2;

                const el = createCardEl(item);
                el.addEventListener('click', () => handleMove(position));
                container.insertBefore(el, container.querySelector('.stagger-nav'));
                cardElements.push(el);
            });

            positionCards();
        }

        // Navigation buttons
        const prevBtn = document.getElementById('staggerPrev');
        const nextBtn = document.getElementById('staggerNext');
        if (prevBtn) prevBtn.addEventListener('click', () => handleMove(-1));
        if (nextBtn) nextBtn.addEventListener('click', () => handleMove(1));

        // Responsive resize
        window.addEventListener('resize', () => {
            const newSize = getCardSize();
            if (newSize !== cardSize) {
                cardSize = newSize;
                cardElements.forEach(el => {
                    el.style.width = cardSize + 'px';
                    el.style.height = cardSize + 'px';
                });
                positionCards();
            }
        });

        // Initial render
        render();
    })();

})();
