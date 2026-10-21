/**
 * SWAYÉ HALLOWEEN — CORE LOGIC
 * Features:
 * - Curtain Intro Video with auto-unlock and skip control
 * - Background Audio looping and interactive Audio FAB toggle
 * - Swiper.js coverflow carousel for Section 4
 * - HTML5 Canvas Horror particle system (ash, embers, flapping bats)
 * - Pure CSS/JS Accordion FAQ
 * - Realtime validated RSVP Form with Google Sheets & WhatsApp API hooks
 * - Smooth scroll & landscape detection
 */

document.addEventListener('DOMContentLoaded', () => {

    // Scroll restoration
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);

    // ── UI Elements ──
    const curtainLayer = document.getElementById('curtain-layer');
    const curtainVideo = document.getElementById('curtain-video');
    const tapIntroTrigger = document.getElementById('tap-intro-trigger');
    const skipIntroBtn = document.getElementById('skip-intro-btn');
    const bgMusic = document.getElementById('bg-music');
    const mfab = document.getElementById('mfab');
    const sec1ScrollCue = document.getElementById('sec1-scroll-cue');

    // ── Swiper.js Initialization ──
    const horrorSwiper = new Swiper('.horror-swiper', {
        slidesPerView: 'auto',
        centeredSlides: true,
        spaceBetween: 14,
        loop: true,
        grabCursor: true,
        speed: 450,
        watchSlidesProgress: true,
        navigation: {
            nextEl: '.swiper-btn-next',
            prevEl: '.swiper-btn-prev',
        },
        autoplay: {
            delay: 3200,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
        },
    });

    // ── Intro Video & Unlock Logic ──
    let isExperienceUnlocked = false;

    function playIntroVideo() {
        if (isExperienceUnlocked) return;
        
        tapIntroTrigger.style.display = 'none';
        curtainVideo.muted = false;
        curtainVideo.volume = 1.0;

        const playPromise = curtainVideo.play();
        if (playPromise !== undefined) {
            playPromise.catch(err => {
                console.warn("Video audio autoplay restricted. Retrying muted:", err);
                curtainVideo.muted = true;
                curtainVideo.play().catch(e => console.log("Final video play failure:", e));
            });
        }

        curtainVideo.addEventListener('ended', unlockExperience, { once: true });
    }

    function unlockExperience() {
        if (isExperienceUnlocked) return;
        isExperienceUnlocked = true;

        // Stop video
        try {
            curtainVideo.pause();
        } catch(e) {}

        // Hide curtain
        curtainLayer.classList.add('hidden');
        document.body.classList.add('unlocked');

        // Reveal Audio FAB
        mfab.classList.add('visible');

        // Start ambient background music
        bgMusic.volume = 0.55;
        const audioPromise = bgMusic.play();
        if (audioPromise !== undefined) {
            audioPromise.catch(() => {
                console.log("Audio autoplay waiting for user interaction");
                mfab.classList.add('muted');
            });
        }
    }

    curtainLayer.addEventListener('click', (e) => {
        if (e.target === skipIntroBtn) return;
        if (!curtainVideo.paused && !curtainVideo.ended) {
            unlockExperience();
        } else {
            playIntroVideo();
        }
    });

    skipIntroBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        unlockExperience();
    });

    // ── Background Audio Toggle FAB ──
    mfab.addEventListener('click', (e) => {
        e.stopPropagation();
        if (bgMusic.paused) {
            bgMusic.play().then(() => {
                mfab.classList.remove('muted');
            }).catch(err => console.log("Audio play error:", err));
        } else {
            bgMusic.pause();
            mfab.classList.add('muted');
        }
    });

    // ── Scroll Indicator Fade on Scroll ──
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            if (sec1ScrollCue) sec1ScrollCue.style.opacity = '0';
        } else {
            if (sec1ScrollCue) sec1ScrollCue.style.opacity = '1';
        }
    }, { passive: true });

    // ── Smooth Scroll for [REGISTER YOUR INTEREST] Buttons ──
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                targetEl.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // ── FAQ Pure CSS/JS Accordion ──
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const header = item.querySelector('.faq-header');
        header.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all FAQs first (single-open accordion)
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
                otherItem.querySelector('.faq-header').setAttribute('aria-expanded', 'false');
            });

            // If wasn't active, open it
            if (!isActive) {
                item.classList.add('active');
                header.setAttribute('aria-expanded', 'true');
            }
        });
    });

    // ── RSVP Form Handling & Validation ──
    const rsvpForm = document.getElementById('rsvp-form');
    const ticketPass = document.getElementById('ticket-pass');
    const fullName = document.getElementById('full-name');
    const instaHandle = document.getElementById('insta-handle');
    const phoneNumber = document.getElementById('phone-number');
    const submitBtn = document.getElementById('rsvp-submit-btn');
    const btnText = document.getElementById('btn-text');
    const successCard = document.getElementById('rsvp-success-card');
    const whatsappDirectLink = document.getElementById('whatsapp-direct-link');
    const successGuestMsg = document.getElementById('success-guest-msg');

    // Format Instagram Link/Handle
    function formatInsta(val) {
        val = (val || '').trim();
        if (!val) return '';
        if (val.startsWith('http://') || val.startsWith('https://')) return val;
        if (val.startsWith('instagram.com') || val.startsWith('www.instagram.com')) return `https://${val}`;
        if (val.startsWith('@')) return `https://instagram.com/${val.substring(1)}`;
        return `https://instagram.com/${val}`;
    }

    // Realtime Validation Helpers
    function validateInput(el, condition) {
        if (condition) {
            el.classList.remove('is-invalid');
            el.classList.add('is-valid');
            return true;
        } else {
            el.classList.remove('is-valid');
            el.classList.add('is-invalid');
            return false;
        }
    }

    fullName.addEventListener('input', () => {
        if (fullName.classList.contains('is-invalid') || fullName.value.trim().length >= 2) {
            validateInput(fullName, fullName.value.trim().length >= 2);
        }
    });

    instaHandle.addEventListener('input', () => {
        if (instaHandle.classList.contains('is-invalid') || instaHandle.value.trim().length >= 2) {
            validateInput(instaHandle, instaHandle.value.trim().length >= 2);
        }
    });

    phoneNumber.addEventListener('input', () => {
        const digits = phoneNumber.value.replace(/\D/g, '');
        if (phoneNumber.classList.contains('is-invalid') || digits.length >= 10) {
            validateInput(phoneNumber, digits.length >= 10);
        }
    });

    ticketPass.addEventListener('change', () => {
        validateInput(ticketPass, ticketPass.value !== '');
    });

    // Google Apps Script Web App Endpoint Hook
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw1ZCVFrgw_X9-t66e9GZDXbKk47FGIqG3JwmH85HQQhD_m6U688DsiY_Eh3M5NOZvMUQ/exec";

    let isSubmitting = false;

    rsvpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        const isPassValid = validateInput(ticketPass, ticketPass.value !== '');
        const isNameValid = validateInput(fullName, fullName.value.trim().length >= 2);
        const isInstaValid = validateInput(instaHandle, instaHandle.value.trim().length >= 2);
        const digits = phoneNumber.value.replace(/\D/g, '');
        const isPhoneValid = validateInput(phoneNumber, digits.length >= 10);

        if (!isPassValid || !isNameValid || !isInstaValid || !isPhoneValid) {
            if (!isPassValid) ticketPass.focus();
            else if (!isNameValid) fullName.focus();
            else if (!isInstaValid) instaHandle.focus();
            else if (!isPhoneValid) phoneNumber.focus();
            return;
        }

        isSubmitting = true;
        submitBtn.disabled = true;
        btnText.innerHTML = '<span class="btn-spinner"></span> SUMMONING THE NIGHT...';

        const guestName = fullName.value.trim();
        const passName = ticketPass.options[ticketPass.selectedIndex].text;
        const guestInsta = formatInsta(instaHandle.value);
        const guestPhone = digits;

        const payload = {
            timestamp: new Date().toISOString(),
            event: "SWAYÉ Halloween 2026",
            passTier: passName,
            guestName: guestName,
            instagram: guestInsta,
            phone: guestPhone
        };

        // Formulate WhatsApp message URL for direct team contact
        const waText = encodeURIComponent(`Hi SWAYÉ Team! I would like to confirm my Halloween RSVP:\n\nName: ${guestName}\nPass: ${passName}\nPhone: ${guestPhone}\nInstagram: ${guestInsta}\n\nSee you after dark!`);
        whatsappDirectLink.href = `https://wa.me/919999999999?text=${waText}`;

        function showSuccess() {
            submitBtn.disabled = false;
            btnText.textContent = 'REGISTER YOUR INTEREST';
            isSubmitting = false;

            rsvpForm.style.display = 'none';
            successGuestMsg.textContent = `Welcome, ${guestName}. Your interest for "${passName}" has been recorded. Tap below to fast-track your confirmation via WhatsApp.`;
            successCard.style.display = 'block';
            successCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        // Attempt sending to Google Apps Script Web App
        if (GOOGLE_SCRIPT_URL && !GOOGLE_SCRIPT_URL.includes("YOUR_SCRIPT_ID")) {
            fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            .then(() => setTimeout(showSuccess, 800))
            .catch(() => setTimeout(showSuccess, 800));
        } else {
            setTimeout(showSuccess, 1000);
        }
    });

    // ══════════════════════════════════════════════════════════════
    // HTML5 CANVAS: FLOATING ASH, GLOWING EMBERS & BATS
    // ══════════════════════════════════════════════════════════════
    const canvas = document.getElementById('horror-canvas');
    const ctx = canvas.getContext('2d');
    let w, h;

    function resizeCanvas() {
        const appRect = document.getElementById('app').getBoundingClientRect();
        w = canvas.width = appRect.width || window.innerWidth;
        h = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Ember / Ash Particle
    class HorrorParticle {
        constructor() {
            this.reset();
            this.y = Math.random() * h;
        }
        reset() {
            this.x = Math.random() * w;
            this.y = h + Math.random() * 20;
            this.size = Math.random() * 2.2 + 0.6;
            this.speedY = -(Math.random() * 0.7 + 0.2);
            this.speedX = (Math.random() - 0.5) * 0.45;
            this.alpha = Math.random() * 0.6 + 0.2;
            this.alphaSpeed = (Math.random() * 0.015) + 0.005;
            // Blood Red or Bone White tint
            this.isEmber = Math.random() > 0.45;
        }
        update() {
            this.y += this.speedY;
            this.x += this.speedX + Math.sin(this.y * 0.02) * 0.3;
            this.alpha += this.alphaSpeed;
            if (this.alpha <= 0.1 || this.alpha >= 0.8) this.alphaSpeed *= -1;

            if (this.y < -10 || this.x < -10 || this.x > w + 10) {
                this.reset();
            }
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            if (this.isEmber) {
                ctx.fillStyle = `rgba(125, 4, 8, ${this.alpha})`;
                ctx.shadowColor = '#7d0408';
                ctx.shadowBlur = 4;
            } else {
                ctx.fillStyle = `rgba(231, 211, 194, ${this.alpha * 0.8})`;
                ctx.shadowBlur = 0;
            }
            ctx.fill();
        }
    }

    // Flying Bat Silhouette
    class BatSilhouette {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = -60;
            this.y = Math.random() * (h * 0.6) + 40;
            this.speedX = Math.random() * 1.8 + 1.2;
            this.speedY = (Math.random() - 0.5) * 0.6;
            this.scale = Math.random() * 0.5 + 0.4;
            this.wingAngle = 0;
            this.wingSpeed = 0.25 + Math.random() * 0.15;
            this.active = false;
        }
        update() {
            if (!this.active) return;
            this.x += this.speedX;
            this.y += this.speedY;
            this.wingAngle += this.wingSpeed;

            if (this.x > w + 80) {
                this.active = false;
            }
        }
        draw() {
            if (!this.active) return;
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.scale(this.scale, this.scale);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';

            const flap = Math.sin(this.wingAngle) * 8;
            // Bat silhouette path
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(8, -12 + flap, 18, -16 + flap);
            ctx.quadraticCurveTo(12, -4 + flap, 14, 4);
            ctx.quadraticCurveTo(8, 2, 0, 8);
            ctx.quadraticCurveTo(-8, 2, -14, 4);
            ctx.quadraticCurveTo(-12, -4 + flap, -18, -16 + flap);
            ctx.quadraticCurveTo(-8, -12 + flap, 0, 0);
            ctx.fill();
            ctx.restore();
        }
    }

    const particles = [];
    for (let i = 0; i < 50; i++) {
        particles.push(new HorrorParticle());
    }

    const bats = [new BatSilhouette(), new BatSilhouette()];
    // Randomly trigger bats
    setInterval(() => {
        const idleBat = bats.find(b => !b.active);
        if (idleBat && Math.random() > 0.3) {
            idleBat.reset();
            idleBat.active = true;
        }
    }, 6000);

    function renderCanvas() {
        ctx.clearRect(0, 0, w, h);

        particles.forEach(p => {
            p.update();
            p.draw();
        });

        bats.forEach(b => {
            b.update();
            b.draw();
        });

        requestAnimationFrame(renderCanvas);
    }
    renderCanvas();

});
