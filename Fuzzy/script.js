// ============================================
// FUZZY BLOOM — AUDIO ALWAYS ON
// ============================================

class AudioEngine {
    constructor() {
        this.enabled = true;
        this.muted = false;
        this.initialized = false;
        this.synth = null;
        this.bass = null;
        this.noise = null;
        this.reverb = null;
        this.filter = null;
        
        // Auto-init on first interaction
        this.bindInitEvents();
    }
    
    bindInitEvents() {
        const initEvents = ['click', 'touchstart', 'keydown', 'scroll'];
        
        const initAudio = async () => {
            if (this.initialized) return;
            
            await Tone.start();
            this.setupSynths();
            this.initialized = true;
            
            // Remove init listeners
            initEvents.forEach(evt => {
                document.removeEventListener(evt, initAudio);
            });
        };
        
        initEvents.forEach(evt => {
            document.addEventListener(evt, initAudio, { once: true, passive: true });
        });
    }
    
    setupSynths() {
        // Reverb for space
        this.reverb = new Tone.Reverb({
            decay: 2.5,
            preDelay: 0.1,
            wet: 0.3
        }).toDestination();
        
        // Filter for warmth
        this.filter = new Tone.Filter(800, "lowpass").connect(this.reverb);
        
        // Main poly synth
        this.synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: {
                type: "triangle"
            },
            envelope: {
                attack: 0.005,
                decay: 0.1,
                sustain: 0.1,
                release: 0.5
            },
            volume: -12
        }).connect(this.filter);
        
        // Bass for depth
        this.bass = new Tone.MembraneSynth({
            pitchDecay: 0.05,
            octaves: 4,
            oscillator: {
                type: "sine"
            },
            envelope: {
                attack: 0.001,
                decay: 0.4,
                sustain: 0.01,
                release: 1.4
            },
            volume: -10
        }).connect(this.reverb);
        
        // Noise for texture
        this.noise = new Tone.NoiseSynth({
            noise: {
                type: "pink"
            },
            envelope: {
                attack: 0.005,
                decay: 0.1,
                sustain: 0
            },
            volume: -20
        }).connect(this.reverb);
    }
    
    setMuted(muted) {
        this.muted = muted;
        Tone.Destination.mute = muted;
    }
    
    playHover() {
        if (this.muted || !this.initialized || !this.synth) return;
        
        const notes = ["C5", "E5", "G5", "A5"];
        const note = notes[Math.floor(Math.random() * notes.length)];
        this.synth.triggerAttackRelease(note, "32n", undefined, 0.3);
    }
    
    playClick() {
        if (this.muted || !this.initialized || !this.synth) return;
        
        this.synth.triggerAttackRelease("G4", "16n", undefined, 0.6);
        this.bass.triggerAttackRelease("C2", "8n");
    }
    
    playFilter() {
        if (this.muted || !this.initialized || !this.synth) return;
        
        this.synth.triggerAttackRelease(["C4", "E4", "G4"], "8n", undefined, 0.5);
        
        if (this.filter) {
            this.filter.frequency.rampTo(2000, 0.1);
            this.filter.frequency.rampTo(800, 0.3);
        }
    }
    
    playSuccess() {
        if (this.muted || !this.initialized || !this.synth) return;
        
        const now = Tone.now();
        this.synth.triggerAttackRelease("C5", "16n", now, 0.4);
        this.synth.triggerAttackRelease("E5", "16n", now + 0.05, 0.4);
        this.synth.triggerAttackRelease("G5", "16n", now + 0.1, 0.4);
        this.synth.triggerAttackRelease("C6", "8n", now + 0.15, 0.5);
        this.bass.triggerAttackRelease("C3", "8n", now);
    }
    
    playFocus() {
        if (this.muted || !this.initialized || !this.synth) return;
        
        this.synth.triggerAttackRelease("A4", "32n", undefined, 0.2);
    }
    
    playThemeSwitch(toDark) {
        if (this.muted || !this.initialized || !this.synth) return;
        
        const now = Tone.now();
        
        if (toDark) {
            this.synth.triggerAttackRelease("C5", "16n", now, 0.4);
            this.synth.triggerAttackRelease("G4", "16n", now + 0.08, 0.4);
            this.synth.triggerAttackRelease("C4", "8n", now + 0.16, 0.5);
        } else {
            this.synth.triggerAttackRelease("C4", "16n", now, 0.4);
            this.synth.triggerAttackRelease("G4", "16n", now + 0.08, 0.4);
            this.synth.triggerAttackRelease("C5", "8n", now + 0.16, 0.5);
        }
    }
    
    playScroll() {
        if (this.muted || !this.initialized || !this.noise) return;
        
        this.noise.triggerAttackRelease("32n", undefined, 0.05);
    }
}

// Initialize
const audio = new AudioEngine();

// ============================================
// MAIN APPLICATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    
    // Audio Control
    const audioControl = document.getElementById('audioControl');
    
    audioControl.addEventListener('click', () => {
        audio.setMuted(!audio.muted);
        updateAudioIcon();
    });
    
    function updateAudioIcon() {
        const icon = audioControl.querySelector('i');
        icon.className = audio.muted ? 'fas fa-volume-mute' : 'fas fa-volume-up';
        audioControl.classList.toggle('muted', audio.muted);
    }
    
    // Attach Sounds
    function attachSounds() {
        document.querySelectorAll('[data-sound="hover"]').forEach(el => {
            el.addEventListener('mouseenter', () => audio.playHover());
        });
        
        document.querySelectorAll('[data-sound="click"]').forEach(el => {
            el.addEventListener('click', () => audio.playClick());
        });
        
        document.querySelectorAll('[data-sound="filter"]').forEach(el => {
            el.addEventListener('click', () => audio.playFilter());
        });
        
        document.querySelectorAll('[data-sound="success"]').forEach(el => {
            el.addEventListener('click', (e) => {
                if (!el.href || el.target === '_blank') {
                    audio.playSuccess();
                }
            });
        });
        
        document.querySelectorAll('[data-sound="focus"]').forEach(el => {
            el.addEventListener('focus', () => audio.playFocus());
        });
    }
    
    attachSounds();
    
    // Mobile Menu
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
        audio.playClick();
    });
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
    
    // Header Scroll
    const header = document.getElementById('header');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        
        if (currentScroll > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        if (Math.abs(currentScroll - lastScroll) > 50) {
            audio.playScroll();
            lastScroll = currentScroll;
        }
    });
    
    // Theme Toggle
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    const icon = themeToggle.querySelector('i');
    
    const savedTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const current = html.getAttribute('data-theme');
        const next = current === 'light' ? 'dark' : 'light';
        
        audio.playThemeSwitch(next === 'dark');
        
        html.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        updateThemeIcon(next);
        
        themeToggle.style.transform = 'scale(0.9)';
        setTimeout(() => themeToggle.style.transform = '', 200);
    });
    
    function updateThemeIcon(theme) {
        icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        themeToggle.style.borderColor = theme === 'light' ? 'var(--text-muted)' : 'var(--accent-ochre)';
        themeToggle.style.color = theme === 'light' ? 'var(--text-secondary)' : 'var(--accent-ochre)';
    }
    
    // Gallery Filtering
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.getAttribute('data-filter');
            
            galleryItems.forEach(item => {
                const category = item.getAttribute('data-category');
                const shouldShow = filter === 'all' || category === filter;
                
                if (shouldShow) {
                    item.classList.remove('hidden');
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        item.classList.add('hidden');
                        item.style.display = 'none';
                    }, 400);
                }
            });
        });
    });
    
    // Lightbox
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxTitle = document.getElementById('lightboxTitle');
    const lightboxDesc = document.getElementById('lightboxDesc');
    const lightboxClose = document.getElementById('lightboxClose');
    
    galleryItems.forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.closest('.btn-whatsapp')) return;
            
            const img = item.querySelector('img').src;
            const title = item.querySelector('h3').textContent;
            const desc = item.querySelector('p').textContent;
            
            lightboxImg.src = img;
            lightboxTitle.textContent = title;
            lightboxDesc.textContent = desc;
            
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
            audio.playClick();
        });
    });
    
    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLightbox();
    });
    
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        audio.playClick();
    }
    
    // Scroll Reveal
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('active');
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -100px 0px' });
    
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
        observer.observe(el);
    });
    
    // Hero Animation
    setTimeout(() => {
        document.querySelectorAll('.hero .reveal').forEach((el, i) => {
            setTimeout(() => el.classList.add('active'), i * 150);
        });
    }, 300);
    
    // Animated Counters
    const stats = document.querySelectorAll('.stat-number[data-count]');
    
    const countObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-count'));
                animateCounter(entry.target, target);
                countObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    stats.forEach(stat => countObserver.observe(stat));
    
    function animateCounter(element, target) {
        let current = 0;
        const increment = target / 30;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
                if (!audio.muted) {
                    audio.synth?.triggerAttackRelease("C6", "64n", undefined, 0.2);
                }
            } else {
                element.textContent = Math.floor(current);
            }
        }, 50);
    }
    
    // Newsletter
    const newsletterForm = document.getElementById('newsletterForm');
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = newsletterForm.querySelector('button');
        const original = btn.textContent;
        
        btn.textContent = 'Subscribed!';
        btn.style.background = 'var(--accent-sage)';
        
        audio.playSuccess();
        
        setTimeout(() => {
            btn.textContent = original;
            btn.style.background = '';
            newsletterForm.reset();
        }, 2000);
    });
});

// WhatsApp
function orderWhatsApp(product) {
    const phone = '971545584534';
    const msg = `Hi Fuzzy Bloom! I'm interested in: ${product}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
}