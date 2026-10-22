import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Heart,
  Sparkles,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  X,
  Camera,
  Sliders,
  Check,
  RotateCcw,
  Maximize2,
  Eye,
  Edit3,
  Upload,
  MailOpen,
  Feather,
  Download,
  HelpCircle,
  Image as ImageIcon,
} from 'lucide-react';

// ============================================================================
// DEFAULT CONFIGURATION & INITIAL DATA
// ============================================================================

const INITIAL_LETTER = `Hey Parul,

I know things haven't been right, and I've been thinking about everything.

I'm genuinely sorry for hurting you. I know that just saying sorry doesn't automatically make things okay, and I don't expect a few words or a website to fix everything.

I just wanted to make something that shows I care enough to try and express what I'm feeling.

You matter to me, and I'm sorry for the part I played in making things difficult. I wish I had handled things better.

I'm not making this to pressure you into forgiving me or to expect anything from you. I just wanted to acknowledge my mistake and tell you honestly that I'm sorry.

Take all the time you need. Whatever you feel, I'll respect it.

— Ansh ❤️`;

// We configure all 7 photographs to first attempt loading from local project paths
// (/photos/photo-1.jpg ... /photos/photo-7.jpg) and gracefully fall back to warm,
// artistic, high-resolution SVG/Unsplash placeholders until local files or browser
// uploads are provided. No fake stories, dates, or locations are invented.
const DEFAULT_PHOTOS = [
  {
    id: 1,
    localSrc: '/photos/photo-1.jpg',
    fallbackSrc:
      'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1200&q=85',
    caption: '',
    frameStyle: 'cinematic-hero', // Featured wide/portrait editorial frame
    aspectRatio: 'aspect-[4/5] md:aspect-[16/11]',
    objectFit: 'cover',
    objectPosition: 'center center',
    rotation: '-0.8deg',
  },
  {
    id: 2,
    localSrc: '/photos/photo-2.jpg',
    fallbackSrc:
      'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=900&q=85',
    caption: '',
    frameStyle: 'polaroid-tape',
    aspectRatio: 'aspect-[4/5]',
    objectFit: 'cover',
    objectPosition: 'center 25%',
    rotation: '1.5deg',
  },
  {
    id: 3,
    localSrc: '/photos/photo-3.jpg',
    fallbackSrc:
      'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=85',
    caption: '',
    frameStyle: 'editorial-arch',
    aspectRatio: 'aspect-[3/4]',
    objectFit: 'cover',
    objectPosition: 'center center',
    rotation: '-1.2deg',
  },
  {
    id: 4,
    localSrc: '/photos/photo-4.jpg',
    fallbackSrc:
      'https://images.unsplash.com/photo-1494774157365-9e04c6720e47?auto=format&fit=crop&w=900&q=85',
    caption: '',
    frameStyle: 'polaroid-classic',
    aspectRatio: 'aspect-[4/5]',
    objectFit: 'cover',
    objectPosition: 'center 30%',
    rotation: '1.1deg',
  },
  {
    id: 5,
    localSrc: '/photos/photo-5.jpg',
    fallbackSrc:
      'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1100&q=85',
    caption: '',
    frameStyle: 'soft-glass',
    aspectRatio: 'aspect-[4/5]',
    objectFit: 'cover',
    objectPosition: 'center center',
    rotation: '-0.9deg',
  },
  {
    id: 6,
    localSrc: '/photos/photo-6.jpg',
    fallbackSrc:
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=85',
    caption: '',
    frameStyle: 'polaroid-tape',
    aspectRatio: 'aspect-[4/5]',
    objectFit: 'cover',
    objectPosition: 'center 20%',
    rotation: '1.4deg',
  },
  {
    id: 7,
    localSrc: '/photos/photo-7.jpg',
    fallbackSrc:
      'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?auto=format&fit=crop&w=1200&q=85',
    caption: '',
    frameStyle: 'cinematic-wide',
    aspectRatio: 'aspect-[4/5] md:aspect-[16/10]',
    objectFit: 'cover',
    objectPosition: 'center center',
    rotation: '0deg',
  },
];

const STORAGE_KEY_PHOTOS = 'ansh_parul_apology_photos_v1';
const STORAGE_KEY_LETTER = 'ansh_parul_apology_letter_v1';

// ============================================================================
// GENTLE GENERATIVE AMBIENT PIANO SYNTHESIZER (WEB AUDIO API)
// Optional, user-controlled, zero external copyrighted MP3 dependencies
// ============================================================================

class GentleAmbientSynth {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.intervalId = null;
    this.masterGain = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.14;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playSoftNote(freq, duration = 4.5, delay = 0) {
    if (!this.ctx || !this.isPlaying) return;
    const now = this.ctx.currentTime + delay;

    const osc = this.ctx.createOscillator();
    const subOsc = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    // Warm felt-piano-like sine + triangle blend
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(freq * 0.5, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, now);

    // Gentle envelope
    noteGain.gain.setValueAtTime(0.0001, now);
    noteGain.gain.exponentialRampToValueAtTime(0.22, now + 0.45);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    subOsc.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(this.masterGain);

    osc.start(now);
    subOsc.start(now);
    osc.stop(now + duration + 0.1);
    subOsc.stop(now + duration + 0.1);
  }

  start() {
    this.init();
    this.isPlaying = true;

    // Warm Fmaj7 / Dmin9 / Bbmaj7 / C6 progressions in Hz
    const chords = [
      [174.61, 220.0, 261.63, 329.63, 392.0], // Fmaj9
      [146.83, 220.0, 261.63, 329.63, 349.23], // Dm9
      [233.08, 293.66, 349.23, 440.0], // Bbmaj7
      [196.0, 246.94, 293.66, 329.63, 392.0], // G6/C
    ];
    let chordIndex = 0;

    const triggerArpeggio = () => {
      if (!this.isPlaying) return;
      const chord = chords[chordIndex % chords.length];
      chord.forEach((freq, idx) => {
        this.playSoftNote(freq, 5.2, idx * 0.65);
      });
      chordIndex++;
    };

    triggerArpeggio();
    this.intervalId = setInterval(triggerArpeggio, 5800);
  }

  stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

// ============================================================================
// CUSTOM HOOK FOR SCROLL REVEAL (Respects prefers-reduced-motion)
// ============================================================================

function useRevealOnScroll() {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReduced) {
      setIsVisible(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(node);
        }
      },
      { threshold: 0.14, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, isVisible];
}

// ============================================================================
// SMART PHOTO COMPONENT (Tries /photos/photo-X.jpg first, then custom/fallback)
// ============================================================================

function SmartMemoryImage({ photo, className = '', onClick, priority = false }) {
  const [currentSrc, setCurrentSrc] = useState(
    photo.customSrc || photo.localSrc
  );
  const [hasTriedLocal, setHasTriedLocal] = useState(Boolean(photo.customSrc));
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (photo.customSrc) {
      setCurrentSrc(photo.customSrc);
      setHasTriedLocal(true);
    } else {
      setCurrentSrc(photo.localSrc);
      setHasTriedLocal(false);
    }
  }, [photo.customSrc, photo.localSrc]);

  const handleError = () => {
    if (!hasTriedLocal) {
      setHasTriedLocal(true);
      setCurrentSrc(photo.fallbackSrc);
    }
  };

  return (
    <div
      className={`relative overflow-hidden bg-[#F3E6E3] ${className}`}
      onClick={onClick}
    >
      {/* Subtle skeleton shimmer while loading */}
      {!isLoaded && (
        <div
          className="absolute inset-0 animate-pulse bg-gradient-to-br from-[#F6E9E6] via-[#EDD8D6] to-[#F6E9E6]"
          aria-hidden="true"
        />
      )}
      <img
        src={currentSrc}
        alt={
          photo.caption
            ? `Memory ${photo.id}: ${photo.caption}`
            : `Memory photograph ${photo.id} of Ansh and Parul`
        }
        loading={priority ? 'eager' : 'lazy'}
        onLoad={() => setIsLoaded(true)}
        onError={handleError}
        style={{
          objectFit: photo.objectFit || 'cover',
          objectPosition: photo.objectPosition || 'center center',
        }}
        className={`w-full h-full transition-all duration-700 ease-out select-none ${
          isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.02]'
        } group-hover:scale-[1.03]`}
      />
    </div>
  );
}

// ============================================================================
// FLOATING PETALS / HEARTS BACKGROUND (Subtle & Respects Reduced Motion)
// ============================================================================

function AmbientPetals() {
  const petals = [
    { id: 1, left: '8%', size: 11, duration: '22s', delay: '0s', type: 'petal' },
    { id: 2, left: '21%', size: 13, duration: '26s', delay: '4s', type: 'heart' },
    { id: 3, left: '37%', size: 9, duration: '20s', delay: '9s', type: 'petal' },
    { id: 4, left: '54%', size: 12, duration: '28s', delay: '2s', type: 'petal' },
    { id: 5, left: '71%', size: 10, duration: '24s', delay: '7s', type: 'heart' },
    { id: 6, left: '86%', size: 12, duration: '25s', delay: '11s', type: 'petal' },
    { id: 7, left: '93%', size: 8, duration: '21s', delay: '5s', type: 'petal' },
  ];

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 motion-reduce:hidden"
      aria-hidden="true"
    >
      {petals.map((p) => (
        <div
          key={p.id}
          style={{
            left: p.left,
            animationDuration: p.duration,
            animationDelay: p.delay,
          }}
          className="absolute -top-10 animate-float-petal opacity-30"
        >
          {p.type === 'heart' ? (
            <svg
              width={p.size}
              height={p.size}
              viewBox="0 0 24 24"
              fill="#D48C94"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          ) : (
            <svg
              width={p.size}
              height={p.size * 1.3}
              viewBox="0 0 20 26"
              fill="#E2A9B0"
            >
              <path d="M10 0C4 6 0 13 2 19C4 24 8 26 10 26C12 26 16 24 18 19C20 13 16 6 10 0Z" />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// MAIN APPLICATION COMPONENT
// ============================================================================

export default function App() {
  // Navigation & Flow States
  const [hasOpenedHeart, setHasOpenedHeart] = useState(false);
  const [isOpeningTransition, setIsOpeningTransition] = useState(false);
  const [introStep, setIntroStep] = useState(0);
  const [hasReadLastThing, setHasReadLastThing] = useState(false);

  // Lightbox State
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Audio State (Never autoplays without explicit user click)
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const synthRef = useRef(null);

  // Studio / Customization Modal State (For Ansh to upload the 7 photos & edit text)
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [showStudioButton, setShowStudioButton] = useState(true);

  // Persistent Photos & Letter Data
  const [photos, setPhotos] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PHOTOS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 7) return parsed;
      }
    } catch (e) {
      // Fallback to default
    }
    return DEFAULT_PHOTOS;
  });

  const [letterText, setLetterText] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LETTER);
      if (saved) return saved;
    } catch (e) {
      // Fallback
    }
    return INITIAL_LETTER;
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PHOTOS, JSON.stringify(photos));
    } catch (e) {
      // Ignore storage quota warnings on huge raw images
    }
  }, [photos]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LETTER, letterText);
    } catch (e) {
      // Ignore
    }
  }, [letterText]);

  // Staggered entrance on the Opening Screen (fast, graceful, never forces waiting)
  useEffect(() => {
    const t1 = setTimeout(() => setIntroStep(1), 250);
    const t2 = setTimeout(() => setIntroStep(2), 950);
    const t3 = setTimeout(() => setIntroStep(3), 1550);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (synthRef.current) {
        synthRef.current.stop();
      }
    };
  }, []);

  // Toggle gentle ambient synth music
  const toggleMusic = () => {
    if (!synthRef.current) {
      synthRef.current = new GentleAmbientSynth();
    }
    if (isMusicPlaying) {
      synthRef.current.stop();
      setIsMusicPlaying(false);
    } else {
      synthRef.current.start();
      setIsMusicPlaying(true);
    }
  };

  // Smooth transition from Welcome Screen to Main Experience
  const handleOpenHeart = () => {
    setIsOpeningTransition(true);
    setTimeout(() => {
      setHasOpenedHeart(true);
      setIsOpeningTransition(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 650);
  };

  // Lightbox Navigation Handlers
  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const showPrevPhoto = useCallback(
    (e) => {
      if (e) e.stopPropagation();
      setLightboxIndex((prev) =>
        prev === null ? null : (prev - 1 + photos.length) % photos.length
      );
    },
    [photos.length]
  );

  const showNextPhoto = useCallback(
    (e) => {
      if (e) e.stopPropagation();
      setLightboxIndex((prev) =>
        prev === null ? null : (prev + 1) % photos.length
      );
    },
    [photos.length]
  );

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showPrevPhoto();
      if (e.key === 'ArrowRight') showNextPhoto();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, closeLightbox, showPrevPhoto, showNextPhoto]);

  // Handle uploading one or multiple photos in the Studio modal
  const handleSinglePhotoUpload = (photoId, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (typeof dataUrl === 'string') {
        setPhotos((prev) =>
          prev.map((p) =>
            p.id === photoId ? { ...p, customSrc: dataUrl } : p
          )
        );
      }
    };
    reader.readAsDataURL(file);
  };

  // Batch upload up to 7 photos at once
  const handleBatchPhotoUpload = (fileList) => {
    if (!fileList || fileList.length === 0) return;
    const filesArray = Array.from(fileList).slice(0, 7);

    filesArray.forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result;
        if (typeof dataUrl === 'string') {
          setPhotos((prev) =>
            prev.map((p, pIdx) =>
              pIdx === idx ? { ...p, customSrc: dataUrl } : p
            )
          );
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const updatePhotoSetting = (photoId, field, value) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === photoId ? { ...p, [field]: value } : p))
    );
  };

  const resetAllCustomizations = () => {
    setPhotos(DEFAULT_PHOTOS);
    setLetterText(INITIAL_LETTER);
    localStorage.removeItem(STORAGE_KEY_PHOTOS);
    localStorage.removeItem(STORAGE_KEY_LETTER);
  };

  // Reveal Hooks for sections
  const [letterRef, letterVisible] = useRevealOnScroll();
  const [galleryHeaderRef, galleryHeaderVisible] = useRevealOnScroll();
  const [reflectionRef, reflectionVisible] = useRevealOnScroll();
  const [footerRef, footerVisible] = useRevealOnScroll();

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#3A1D21] relative selection:bg-[#E8C5C8] selection:text-[#3A1D21] overflow-x-hidden font-sans">
      {/* Google Fonts & Custom Keyframe Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600&family=Caveat:wght@500;600&display=swap');

        .font-serif-editorial {
          font-family: 'Cormorant Garamond', Georgia, serif;
        }
        .font-sans-clean {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        .font-handwritten {
          font-family: 'Caveat', cursive;
        }

        @keyframes floatPetal {
          0% {
            transform: translateY(-5vh) translateX(0px) rotate(0deg);
            opacity: 0;
          }
          15% {
            opacity: 0.35;
          }
          50% {
            transform: translateY(50vh) translateX(24px) rotate(160deg);
          }
          85% {
            opacity: 0.35;
          }
          100% {
            transform: translateY(105vh) translateX(-16px) rotate(340deg);
            opacity: 0;
          }
        }

        .animate-float-petal {
          animation-name: floatPetal;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        @keyframes pulseSlow {
          0%, 100% { transform: scale(1); opacity: 0.55; }
          50% { transform: scale(1.08); opacity: 0.8; }
        }

        .animate-pulse-slow {
          animation: pulseSlow 7s ease-in-out infinite;
        }

        /* Subtle film & paper grain overlay */
        .paper-grain {
          background-image: radial-gradient(rgba(94, 42, 48, 0.04) 1px, transparent 0);
          background-size: 24px 24px;
        }

        /* Washi tape effect for scrapbook polaroids */
        .washi-tape {
          background: rgba(244, 225, 224, 0.72);
          box-shadow: 0 1px 3px rgba(58, 29, 33, 0.08);
          backdrop-filter: blur(2px);
          border-left: 1px dashed rgba(184, 93, 101, 0.25);
          border-right: 1px dashed rgba(184, 93, 101, 0.25);
        }
      `}</style>

      {/* Soft Ambient Background Glows */}
      <div
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -top-32 -left-32 w-[28rem] h-[28rem] rounded-full bg-[#F4E1E0]/60 blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/3 -right-32 w-[32rem] h-[32rem] rounded-full bg-[#EED6D5]/50 blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-32 left-1/4 w-[30rem] h-[30rem] rounded-full bg-[#F9EAE6]/70 blur-3xl animate-pulse-slow" />
        <div className="absolute inset-0 paper-grain" />
      </div>

      {/* Gentle Floating Petals & Hearts */}
      <AmbientPetals />

      {/* ====================================================================
          TOP FLOATING CONTROLS (Music Toggle & Discreet Photo Studio Button)
      ==================================================================== */}
      <header className="fixed top-0 left-0 right-0 z-40 px-4 sm:px-8 py-4 flex items-center justify-between pointer-events-none">
        {/* Subtle Brand / Initials Pill */}
        <div className="pointer-events-auto">
          {hasOpenedHeart && (
            <button
              onClick={() => setHasOpenedHeart(false)}
              title="Return to opening screen"
              className="group flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FDFBF7]/80 backdrop-blur-md border border-[#E6CECC]/80 shadow-sm text-xs tracking-widest uppercase text-[#6D3B40] hover:text-[#3A1D21] hover:border-[#C98B8B] transition-all focus:outline-none focus:ring-2 focus:ring-[#B85D65]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#B85D65] group-hover:scale-125 transition-transform" />
              <span className="font-serif-editorial italic text-sm capitalize tracking-normal">
                For Parul
              </span>
            </button>
          )}
        </div>

        {/* Right Controls: Optional Music + Customize 7 Photos Studio */}
        <div className="flex items-center gap-2.5 pointer-events-auto">
          {showStudioButton && (
            <button
              onClick={() => setIsStudioOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#FDFBF7]/85 backdrop-blur-md border border-[#E6CECC] shadow-sm text-xs font-medium text-[#5E2A30] hover:bg-[#F9F0EE] hover:border-[#C98B8B] transition-all focus:outline-none focus:ring-2 focus:ring-[#B85D65]"
              aria-label="Customize the 7 photos and letter"
            >
              <Camera className="w-3.5 h-3.5 text-[#B85D65]" />
              <span className="hidden sm:inline">Manage 7 Photos</span>
              <span className="sm:hidden">Photos</span>
            </button>
          )}

          <button
            onClick={toggleMusic}
            aria-pressed={isMusicPlaying}
            aria-label={
              isMusicPlaying
                ? 'Pause gentle background music'
                : 'Play gentle background music'
            }
            className={`flex items-center gap-2 px-3.5 py-2 rounded-full backdrop-blur-md border shadow-sm text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[#B85D65] ${
              isMusicPlaying
                ? 'bg-[#5E2A30] text-[#FDFBF7] border-[#5E2A30]'
                : 'bg-[#FDFBF7]/85 text-[#5E2A30] border-[#E6CECC] hover:bg-[#F9F0EE]'
            }`}
          >
            {isMusicPlaying ? (
              <>
                <Volume2 className="w-3.5 h-3.5 animate-pulse text-[#F4E1E0]" />
                <span className="hidden sm:inline">Ambient Piano On</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-[#8C585E]" />
                <span className="hidden sm:inline">Soft Music</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* ====================================================================
          1. CINEMATIC OPENING SCREEN — THE EMOTIONAL HOOK
      ==================================================================== */}
      {!hasOpenedHeart && (
        <section
          aria-label="Welcome message for Parul"
          className={`relative z-20 min-h-screen flex flex-col items-center justify-center px-6 py-16 text-center transition-all duration-700 ease-in-out ${
            isOpeningTransition
              ? 'opacity-0 scale-[0.98] -translate-y-3'
              : 'opacity-100 scale-100 translate-y-0'
          }`}
        >
          {/* Decorative Soft Halo */}
          <div
            className="w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-gradient-to-tr from-[#F4E1E0]/80 via-[#F9ECEA]/60 to-transparent blur-2xl absolute pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative max-w-xl mx-auto flex flex-col items-center">
            {/* Small Botanical / Heart Emblem */}
            <div
              className={`mb-8 p-3.5 rounded-full bg-[#F9F1EE] border border-[#E8D0CE] shadow-sm transition-all duration-700 ${
                introStep >= 1
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-4'
              }`}
            >
              <Heart
                className="w-5 h-5 text-[#B85D65] fill-[#B85D65]/20"
                strokeWidth={1.6}
              />
            </div>

            {/* Primary Emotional Greeting */}
            <h1
              className={`font-serif-editorial text-4xl sm:text-6xl md:text-7xl font-normal tracking-tight text-[#3A1D21] mb-5 transition-all duration-1000 ease-out ${
                introStep >= 1
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-5'
              }`}
            >
              Hey, Parul… <span className="inline-block">❤️</span>
            </h1>

            {/* Subtitle Reveal */}
            <p
              className={`font-serif-editorial italic text-2xl sm:text-3xl text-[#6D3B40] mb-12 transition-all duration-1000 ease-out ${
                introStep >= 2
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-4'
              }`}
            >
              I made something for you.
            </p>

            {/* "Open my heart" Call-to-Action Button */}
            <div
              className={`transition-all duration-1000 ease-out ${
                introStep >= 3
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-4'
              }`}
            >
              <button
                onClick={handleOpenHeart}
                className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#5E2A30] text-[#FDFBF7] text-sm sm:text-base font-medium tracking-wide shadow-[0_12px_30px_-8px_rgba(94,42,48,0.45)] hover:bg-[#491F24] hover:shadow-[0_16px_36px_-6px_rgba(94,42,48,0.55)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#B85D65] focus:ring-offset-4 focus:ring-offset-[#FDFBF7]"
              >
                <MailOpen className="w-4 h-4 text-[#F4E1E0] transition-transform duration-300 group-hover:scale-110" />
                <span>Open my heart</span>
              </button>
            </div>

            {/* Subtle Reassurance Note */}
            <p
              className={`mt-10 text-xs uppercase tracking-[0.2em] text-[#9A6B70] transition-opacity duration-1000 delay-300 ${
                introStep >= 3 ? 'opacity-80' : 'opacity-0'
              }`}
            >
              A personal note from Ansh
            </p>
          </div>
        </section>
      )}

      {/* ====================================================================
          MAIN APOLOGY EXPERIENCE (Revealed smoothly after Opening Screen)
      ==================================================================== */}
      {hasOpenedHeart && (
        <main className="relative z-10 pt-24 pb-28">
          {/* ----------------------------------------------------------------
              HERO HEADER BANNER
          ---------------------------------------------------------------- */}
          <div className="max-w-3xl mx-auto px-6 pt-6 pb-10 text-center animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F4E1E0]/70 border border-[#E4C7C6] text-[#6D3B40] text-xs tracking-widest uppercase mb-5">
              <Feather className="w-3.5 h-3.5 text-[#B85D65]" />
              <span>A Letter For You</span>
            </div>
            <h1 className="font-serif-editorial text-4xl sm:text-6xl text-[#3A1D21] font-normal leading-tight">
              I’m Sorry, Parul
            </h1>
            <div className="mt-4 flex items-center justify-center gap-3 text-[#C98B8B]">
              <span className="h-px w-12 bg-[#E2C2C1]" />
              <Heart className="w-3.5 h-3.5 fill-[#D8A7A7] text-[#D8A7A7]" />
              <span className="h-px w-12 bg-[#E2C2C1]" />
            </div>
          </div>

          {/* ----------------------------------------------------------------
              2. THE APOLOGY LETTER SECTION
          ---------------------------------------------------------------- */}
          <section
            ref={letterRef}
            aria-label="Apology letter from Ansh to Parul"
            className={`max-w-2xl mx-auto px-5 sm:px-8 mb-28 transition-all duration-1000 ease-out ${
              letterVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="relative rounded-3xl bg-[#FFFDFB] border border-[#EAD4D2] shadow-[0_25px_60px_-15px_rgba(94,42,48,0.09)] p-8 sm:p-12 md:p-16 overflow-hidden">
              {/* Top Corner Subtle Decorative Emboss */}
              <div
                className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#F4E1E0] via-[#C98B8B] to-[#F4E1E0]"
                aria-hidden="true"
              />

              {/* Subtle Wax-Seal Inspired Emblem */}
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#F3E4E2]">
                <div>
                  <span className="block text-[11px] uppercase tracking-[0.22em] text-[#9E6E74]">
                    From the heart
                  </span>
                  <span className="font-serif-editorial italic text-lg text-[#5E2A30]">
                    To Parul, with honesty & care
                  </span>
                </div>
                <div
                  className="w-11 h-11 rounded-full bg-gradient-to-br from-[#B85D65] to-[#7A353C] shadow-inner flex items-center justify-center text-[#FDFBF7] border-2 border-[#E6C5C7]"
                  aria-hidden="true"
                >
                  <Heart className="w-4 h-4 fill-current" />
                </div>
              </div>

              {/* Letter Paragraphs */}
              <article className="space-y-5 text-[#3A1D21]/90 font-sans-clean text-base sm:text-[17px] leading-[1.85] tracking-[0.01em]">
                {letterText.split('\n\n').map((paragraph, idx, arr) => {
                  const isGreeting = idx === 0 && paragraph.startsWith('Hey');
                  const isSignOff =
                    idx === arr.length - 1 &&
                    (paragraph.includes('Ansh') || paragraph.startsWith('—'));

                  if (isGreeting) {
                    return (
                      <p
                        key={idx}
                        className="font-serif-editorial text-2xl sm:text-3xl text-[#3A1D21] font-medium mb-6"
                      >
                        {paragraph}
                      </p>
                    );
                  }

                  if (isSignOff) {
                    return (
                      <div key={idx} className="pt-6">
                        <p className="font-handwritten text-3xl sm:text-4xl text-[#5E2A30]">
                          {paragraph}
                        </p>
                      </div>
                    );
                  }

                  return (
                    <p key={idx} className="text-[#4A252A]">
                      {paragraph}
                    </p>
                  );
                })}
              </article>

              {/* Subtle Bottom Corner Accent */}
              <div
                className="mt-10 pt-6 border-t border-[#F3E4E2] flex items-center justify-between text-xs text-[#9E6E74]"
                aria-hidden="true"
              >
                <span>No expectations. Just honesty.</span>
                <span className="font-serif-editorial italic text-sm">
                  Always respectful of your space
                </span>
              </div>
            </div>
          </section>

          {/* ----------------------------------------------------------------
              3. THE SEVEN-PHOTO MEMORY GALLERY
          ---------------------------------------------------------------- */}
          <section
            aria-labelledby="memory-gallery-heading"
            className="max-w-6xl mx-auto px-5 sm:px-8 mb-28"
          >
            {/* Gallery Section Header */}
            <div
              ref={galleryHeaderRef}
              className={`max-w-xl mx-auto text-center mb-14 transition-all duration-1000 ease-out ${
                galleryHeaderVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
            >
              <span className="text-xs uppercase tracking-[0.22em] text-[#9E6E74] block mb-2">
                Seven Keepsakes
              </span>
              <h2
                id="memory-gallery-heading"
                className="font-serif-editorial text-3xl sm:text-5xl text-[#3A1D21] font-normal mb-4"
              >
                A few moments worth remembering
              </h2>
              <p className="text-sm sm:text-base text-[#6D3B40] leading-relaxed">
                Click any photograph to view it full-screen.
              </p>
            </div>

            {/* Scrapbook & Editorial 7-Photo Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 items-center">
              {/* PHOTO 1: Large Cinematic Feature (Spans 7 columns on desktop) */}
              <MemoryGalleryCard
                photo={photos[0]}
                index={0}
                onOpen={() => openLightbox(0)}
                gridClass="md:col-span-7"
                priority
              />

              {/* PHOTO 2: Tilted Polaroid with Washi Tape (Spans 5 columns) */}
              <MemoryGalleryCard
                photo={photos[1]}
                index={1}
                onOpen={() => openLightbox(1)}
                gridClass="md:col-span-5"
                priority
              />

              {/* PHOTO 3: Editorial Arch Portrait (Spans 4 columns) */}
              <MemoryGalleryCard
                photo={photos[2]}
                index={2}
                onOpen={() => openLightbox(2)}
                gridClass="md:col-span-4"
              />

              {/* PHOTO 4: Classic Polaroid Keepsake (Spans 4 columns) */}
              <MemoryGalleryCard
                photo={photos[3]}
                index={3}
                onOpen={() => openLightbox(3)}
                gridClass="md:col-span-4"
              />

              {/* PHOTO 5: Soft Glassmorphic Frame (Spans 4 columns) */}
              <MemoryGalleryCard
                photo={photos[4]}
                index={4}
                onOpen={() => openLightbox(4)}
                gridClass="md:col-span-4"
              />

              {/* PHOTO 6: Polaroid with Tape (Spans 5 columns) */}
              <MemoryGalleryCard
                photo={photos[5]}
                index={5}
                onOpen={() => openLightbox(5)}
                gridClass="md:col-span-5"
              />

              {/* PHOTO 7: Wide Cinematic Closing Memory (Spans 7 columns) */}
              <MemoryGalleryCard
                photo={photos[6]}
                index={6}
                onOpen={() => openLightbox(6)}
                gridClass="md:col-span-7"
              />
            </div>
          </section>

          {/* ----------------------------------------------------------------
              4. INTERACTIVE APOLOGY & REFLECTION MOMENT
          ---------------------------------------------------------------- */}
          <section
            ref={reflectionRef}
            aria-labelledby="reflection-heading"
            className={`max-w-2xl mx-auto px-5 sm:px-8 mb-24 transition-all duration-1000 ease-out ${
              reflectionVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="relative rounded-3xl bg-gradient-to-b from-[#FAF0EE] to-[#FDFBF7] border border-[#E6CECC] shadow-[0_20px_50px_-15px_rgba(94,42,48,0.08)] p-8 sm:p-14 text-center overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-[#F4E1E0] border border-[#E2C2C1] flex items-center justify-center mx-auto mb-6 text-[#B85D65]">
                <Sparkles className="w-4 h-4" />
              </div>

              <h2
                id="reflection-heading"
                className="font-serif-editorial text-3xl sm:text-4xl text-[#3A1D21] font-normal mb-5"
              >
                One thing I want you to know…
              </h2>

              <p className="font-sans-clean text-base sm:text-lg text-[#4A252A] leading-relaxed max-w-lg mx-auto mb-9">
                “I can't change what happened, but I can take responsibility for
                my part and do better.”
              </p>

              {!hasReadLastThing ? (
                <button
                  onClick={() => setHasReadLastThing(true)}
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#5E2A30] text-[#FDFBF7] text-sm sm:text-base font-medium shadow-md hover:bg-[#491F24] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#B85D65] focus:ring-offset-2"
                >
                  <Heart className="w-4 h-4 text-[#F4E1E0]" />
                  <span>Read one last thing</span>
                </button>
              ) : (
                <div
                  role="status"
                  aria-live="polite"
                  className="mt-6 pt-7 border-t border-[#E8D0CE] animate-fadeIn"
                >
                  <p className="font-serif-editorial italic text-2xl sm:text-3xl text-[#5E2A30] leading-relaxed max-w-lg mx-auto">
                    “I’m sorry, Parul. No pressure to reply or forgive me right
                    away. I just wanted you to know that I mean it.”
                  </p>
                  <div className="mt-5 flex items-center justify-center gap-2 text-xs uppercase tracking-[0.2em] text-[#9E6E74]">
                    <span>— Ansh</span>
                    <Heart className="w-3.5 h-3.5 text-[#B85D65] fill-[#B85D65]" />
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ----------------------------------------------------------------
              5. RESPECTFUL CLOSING FOOTER
          ---------------------------------------------------------------- */}
          <footer
            ref={footerRef}
            className={`max-w-xl mx-auto px-6 text-center transition-all duration-1000 ${
              footerVisible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="flex items-center justify-center gap-3 mb-4 text-[#D8A7A7]">
              <span className="h-px w-10 bg-[#E6CECC]" />
              <Heart className="w-3.5 h-3.5 fill-current" />
              <span className="h-px w-10 bg-[#E6CECC]" />
            </div>
            <p className="font-serif-editorial italic text-lg text-[#6D3B40] mb-1">
              Made with care for Parul
            </p>
            <p className="text-xs text-[#9E6E74] tracking-wide">
              Take all the time you need.
            </p>
          </footer>
        </main>
      )}

      {/* ====================================================================
          FULL-SCREEN LIGHTBOX VIEWER FOR THE 7 PHOTOS
      ==================================================================== */}
      {lightboxIndex !== null && photos[lightboxIndex] && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Full-screen photo ${lightboxIndex + 1} of ${photos.length}`}
          className="fixed inset-0 z-50 bg-[#231013]/92 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-8 animate-fadeIn"
          onClick={closeLightbox}
        >
          {/* Top Bar: Counter & Close Button */}
          <div
            className="w-full max-w-5xl flex items-center justify-between text-[#F9F4EF] mb-4 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-xs sm:text-sm tracking-widest uppercase text-[#E8C5C8]">
              Memory {String(lightboxIndex + 1).padStart(2, '0')} /{' '}
              {String(photos.length).padStart(2, '0')}
            </span>

            <button
              onClick={closeLightbox}
              aria-label="Close full-screen photo viewer"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-[#FDFBF7] text-xs uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-[#F4E1E0]"
            >
              <span>Close</span>
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Center Image Stage with Prev/Next Controls */}
          <div
            className="relative w-full max-w-4xl max-h-[76vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Previous Button */}
            <button
              onClick={showPrevPhoto}
              aria-label="Previous photo"
              className="absolute left-2 sm:-left-14 z-20 p-3 rounded-full bg-[#3A1D21]/80 hover:bg-[#5E2A30] text-[#FDFBF7] border border-white/15 shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#F4E1E0]"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Full Photo Display (Preserves faces without cropping) */}
            <div className="relative rounded-2xl overflow-hidden bg-[#1A0B0D] border border-white/15 shadow-2xl max-h-[75vh] flex items-center justify-center">
              <LightboxImage photo={photos[lightboxIndex]} />
            </div>

            {/* Next Button */}
            <button
              onClick={showNextPhoto}
              aria-label="Next photo"
              className="absolute right-2 sm:-right-14 z-20 p-3 rounded-full bg-[#3A1D21]/80 hover:bg-[#5E2A30] text-[#FDFBF7] border border-white/15 shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#F4E1E0]"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Optional Caption & Thumbnail Strip */}
          <div
            className="mt-5 flex flex-col items-center gap-3 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {photos[lightboxIndex].caption && (
              <p className="font-handwritten text-2xl text-[#F4E1E0] text-center max-w-md">
                {photos[lightboxIndex].caption}
              </p>
            )}

            {/* Quick Dots Navigation */}
            <div className="flex items-center gap-2">
              {photos.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => setLightboxIndex(idx)}
                  aria-label={`View photo ${idx + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    idx === lightboxIndex
                      ? 'w-7 bg-[#E2A9B0]'
                      : 'w-2 bg-white/30 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          PHOTO & LETTER CUSTOMIZATION STUDIO MODAL (For Ansh)
      ==================================================================== */}
      {isStudioOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="studio-modal-title"
          className="fixed inset-0 z-50 bg-[#231013]/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
        >
          <div className="bg-[#FDFBF7] border border-[#E6CECC] rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-[#F9F1EE] border-b border-[#E6CECC] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Camera className="w-5 h-5 text-[#B85D65]" />
                <div>
                  <h2
                    id="studio-modal-title"
                    className="font-serif-editorial text-2xl text-[#3A1D21] font-medium"
                  >
                    Ansh’s Photo & Letter Studio
                  </h2>
                  <p className="text-xs text-[#6D3B40]">
                    Add your 7 real photos of you & Parul, adjust framing so
                    faces are never cropped, or edit captions.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsStudioOpen(false)}
                aria-label="Close studio"
                className="p-2 rounded-full hover:bg-[#EDD8D6] text-[#5E2A30] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-8 text-sm">
              {/* Quick Batch Upload Banner */}
              <div className="rounded-2xl bg-[#FAF0EE] border border-[#E4C7C6] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-medium text-[#3A1D21] mb-1 flex items-center gap-2">
                    <Upload className="w-4 h-4 text-[#B85D65]" />
                    <span>Select all 7 photos at once (or place in /public/photos/)</span>
                  </h3>
                  <p className="text-xs text-[#6D3B40] leading-relaxed">
                    You can either place <code className="bg-white/80 px-1.5 py-0.5 rounded text-[#5E2A30]">photo-1.jpg</code> through{' '}
                    <code className="bg-white/80 px-1.5 py-0.5 rounded text-[#5E2A30]">photo-7.jpg</code> inside your{' '}
                    <code className="bg-white/80 px-1.5 py-0.5 rounded text-[#5E2A30]">public/photos/</code> folder, or select 7 photos right here from your phone or computer.
                  </p>
                </div>
                <label className="shrink-0 cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#5E2A30] text-[#FDFBF7] text-xs font-medium hover:bg-[#491F24] transition-colors shadow-sm">
                  <ImageIcon className="w-4 h-4" />
                  <span>Choose up to 7 Photos</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleBatchPhotoUpload(e.target.files)}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Individual 7 Photo Slots */}
              <div>
                <h3 className="font-serif-editorial text-xl text-[#3A1D21] mb-4">
                  Fine-Tune All 7 Photographs (Framing & Optional Captions)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {photos.map((photo, index) => (
                    <div
                      key={photo.id}
                      className="rounded-2xl bg-white border border-[#EAD4D2] p-4 flex gap-4 items-start shadow-sm"
                    >
                      <div className="w-24 h-28 rounded-xl overflow-hidden shrink-0 border border-[#E6CECC] bg-[#F4E1E0]">
                        <SmartMemoryImage
                          photo={photo}
                          className="w-full h-full"
                        />
                      </div>

                      <div className="flex-1 min-w-0 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-xs uppercase tracking-wider text-[#5E2A30]">
                            Photo #{index + 1}
                          </span>
                          <label className="cursor-pointer text-xs text-[#B85D65] hover:underline font-medium flex items-center gap-1">
                            <Upload className="w-3 h-3" />
                            <span>Replace</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleSinglePhotoUpload(
                                  photo.id,
                                  e.target.files?.[0]
                                )
                              }
                              className="hidden"
                            />
                          </label>
                        </div>

                        {/* Fit & Focal Position so faces are never cropped */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] uppercase tracking-wider text-[#8C585E] mb-0.5">
                              Fit Mode
                            </label>
                            <select
                              value={photo.objectFit}
                              onChange={(e) =>
                                updatePhotoSetting(
                                  photo.id,
                                  'objectFit',
                                  e.target.value
                                )
                              }
                              className="w-full rounded-lg border border-[#E2C2C1] bg-[#FDFBF7] px-2 py-1 text-xs text-[#3A1D21]"
                            >
                              <option value="cover">Fill Frame</option>
                              <option value="contain">Full Uncropped</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase tracking-wider text-[#8C585E] mb-0.5">
                              Face Alignment
                            </label>
                            <select
                              value={photo.objectPosition}
                              onChange={(e) =>
                                updatePhotoSetting(
                                  photo.id,
                                  'objectPosition',
                                  e.target.value
                                )
                              }
                              className="w-full rounded-lg border border-[#E2C2C1] bg-[#FDFBF7] px-2 py-1 text-xs text-[#3A1D21]"
                            >
                              <option value="center center">Center</option>
                              <option value="center 20%">Upper / Faces</option>
                              <option value="center top">Top Edge</option>
                              <option value="center bottom">Bottom</option>
                            </select>
                          </div>
                        </div>

                        {/* Optional Caption (Blank by default so nothing is invented) */}
                        <div>
                          <input
                            type="text"
                            placeholder="Optional caption (leave blank if preferred)"
                            value={photo.caption}
                            onChange={(e) =>
                              updatePhotoSetting(
                                photo.id,
                                'caption',
                                e.target.value
                              )
                            }
                            className="w-full rounded-lg border border-[#E2C2C1] bg-[#FDFBF7] px-2.5 py-1.5 text-xs text-[#3A1D21] placeholder:text-[#B38B90]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Editable Apology Letter Text */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="apology-letter-editor"
                    className="font-serif-editorial text-xl text-[#3A1D21]"
                  >
                    Edit Apology Letter Copy
                  </label>
                  <span className="text-xs text-[#8C585E]">
                    Separate paragraphs with a blank line
                  </span>
                </div>
                <textarea
                  id="apology-letter-editor"
                  rows={8}
                  value={letterText}
                  onChange={(e) => setLetterText(e.target.value)}
                  className="w-full rounded-2xl border border-[#E2C2C1] bg-white p-4 text-sm text-[#3A1D21] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#B85D65]"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-[#F9F1EE] border-t border-[#E6CECC] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={resetAllCustomizations}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[#D8A7A7] text-xs text-[#6D3B40] hover:bg-[#F4E1E0] transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Defaults</span>
                </button>

                <button
                  onClick={() => {
                    setShowStudioButton(false);
                    setIsStudioOpen(false);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[#D8A7A7] text-xs text-[#6D3B40] hover:bg-[#F4E1E0] transition-colors"
                  title="Hides the top 'Manage 7 Photos' button so Parul sees only the pure experience"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Hide Studio Button (Parul View)</span>
                </button>
              </div>

              <button
                onClick={() => setIsStudioOpen(false)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#5E2A30] text-[#FDFBF7] text-xs font-medium hover:bg-[#491F24] transition-colors shadow-sm"
              >
                <Check className="w-4 h-4" />
                <span>Save & View Website</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// INDIVIDUAL SCRAPBOOK / EDITORIAL PHOTO CARD COMPONENT
// ============================================================================

function MemoryGalleryCard({ photo, index, onOpen, gridClass, priority = false }) {
  const [cardRef, isVisible] = useRevealOnScroll();

  const isPolaroid =
    photo.frameStyle === 'polaroid-tape' ||
    photo.frameStyle === 'polaroid-classic';
  const hasTape = photo.frameStyle === 'polaroid-tape';
  const isArch = photo.frameStyle === 'editorial-arch';

  return (
    <div
      ref={cardRef}
      style={{
        transitionDelay: `${(index % 3) * 90}ms`,
      }}
      className={`${gridClass} transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      <figure
        style={{
          transform: `rotate(${photo.rotation || '0deg'})`,
        }}
        className={`group relative mx-auto transition-all duration-500 hover:rotate-0 hover:-translate-y-1.5 ${
          isPolaroid
            ? 'bg-[#FFFDFB] p-3.5 sm:p-4 pb-6 rounded-2xl border border-[#EAD4D2] shadow-[0_18px_40px_-15px_rgba(94,42,48,0.14)]'
            : 'bg-[#FFFDFB]/90 p-2.5 sm:p-3 rounded-3xl border border-[#EAD4D2] shadow-[0_20px_50px_-15px_rgba(94,42,48,0.12)]'
        }`}
      >
        {/* Optional Washi Tape Top Accent for Scrapbook Feel */}
        {hasTape && (
          <div
            className="washi-tape absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-6 z-20 rotate-[-2deg] rounded-sm pointer-events-none"
            aria-hidden="true"
          />
        )}

        {/* Clickable Image Container */}
        <button
          type="button"
          onClick={onOpen}
          aria-label={
            photo.caption
              ? `Open photo ${index + 1}: ${photo.caption}`
              : `Open memory photograph ${index + 1} in full-screen viewer`
          }
          className={`relative block w-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#B85D65] ${
            isArch
              ? 'rounded-t-[120px] rounded-b-2xl'
              : isPolaroid
              ? 'rounded-xl'
              : 'rounded-2xl'
          } ${photo.aspectRatio}`}
        >
          <SmartMemoryImage
            photo={photo}
            priority={priority}
            className="w-full h-full"
          />

          {/* Subtle Warm Hover Vignette & Expand Icon */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#3A1D21]/35 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-4">
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#FDFBF7] bg-[#3A1D21]/60 backdrop-blur-sm px-3 py-1 rounded-full">
              Memory 0{index + 1}
            </span>
            <span className="p-2 rounded-full bg-[#FDFBF7]/90 text-[#3A1D21] shadow-sm">
              <Maximize2 className="w-3.5 h-3.5" />
            </span>
          </div>
        </button>

        {/* Footer inside Frame: Either User's Caption or Subtle Numbering */}
        <figcaption className="mt-3 px-1.5 flex items-center justify-between text-xs text-[#8C585E]">
          {photo.caption ? (
            <span className="font-handwritten text-xl text-[#4A252A] truncate">
              {photo.caption}
            </span>
          ) : (
            <span className="font-serif-editorial italic text-sm text-[#8C585E]">
              Moment 0{index + 1}
            </span>
          )}
          <Heart className="w-3 h-3 text-[#D8A7A7] group-hover:text-[#B85D65] group-hover:fill-[#B85D65] transition-colors shrink-0" />
        </figcaption>
      </figure>
    </div>
  );
}

// ============================================================================
// LIGHTBOX HIGH-RES IMAGE COMPONENT (Uncropped Full View)
// ============================================================================

function LightboxImage({ photo }) {
  const [src, setSrc] = useState(photo.customSrc || photo.localSrc);
  const [triedLocal, setTriedLocal] = useState(Boolean(photo.customSrc));

  useEffect(() => {
    if (photo.customSrc) {
      setSrc(photo.customSrc);
      setTriedLocal(true);
    } else {
      setSrc(photo.localSrc);
      setTriedLocal(false);
    }
  }, [photo]);

  return (
    <img
      src={src}
      alt={
        photo.caption
          ? photo.caption
          : `Memory photograph ${photo.id} of Ansh and Parul`
      }
      onError={() => {
        if (!triedLocal) {
          setTriedLocal(true);
          setSrc(photo.fallbackSrc);
        }
      }}
      className="max-h-[74vh] max-w-[90vw] w-auto h-auto object-contain select-none"
    />
  );
}
