import React, { useState, useEffect, useRef } from 'react';
import {
  Heart,
  Volume2,
  VolumeX,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Camera,
  Edit3,
  Eye,
  RotateCcw,
  Check,
  Maximize2
} from 'lucide-react';

const DEFAULT_LETTER = `Hey Parul,

I know things haven't been right, and I've been thinking about everything.

I'm genuinely sorry for hurting you. I know that just saying sorry doesn't automatically make things okay, and I don't expect a few words or a website to fix everything.

I just wanted to make something that shows I care enough to try and express what I'm feeling.

You matter to me, and I'm sorry for the part I played in making things difficult. I wish I had handled things better.

I'm not making this to pressure you into forgiving me or to expect anything from you. I just wanted to acknowledge my mistake and tell you honestly that I'm sorry.

Take all the time you need. Whatever you feel, I'll respect it.

— Ansh ❤️`;

const INITIAL_PHOTOS = [
  {
    id: 1,
    src: '/photos/photo-1.jpg',
    fallback: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=900&q=80',
    caption: 'A quiet moment',
    style: 'landscape',
    rotation: '-rotate-1',
    position: 'center'
  },
  {
    id: 2,
    src: '/photos/photo-2.jpg',
    fallback: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=900&q=80',
    caption: 'Us together',
    style: 'portrait',
    rotation: 'rotate-1',
    position: 'top'
  },
  {
    id: 3,
    src: '/photos/photo-3.jpg',
    fallback: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=80',
    caption: 'Walking side by side',
    style: 'arch',
    rotation: '-rotate-1',
    position: 'center'
  },
  {
    id: 4,
    src: '/photos/photo-4.jpg',
    fallback: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=900&q=80',
    caption: 'Being goofy',
    style: 'polaroid',
    rotation: 'rotate-1',
    position: 'center'
  },
  {
    id: 5,
    src: '/photos/photo-5.jpg',
    fallback: 'https://images.unsplash.com/photo-1494774157365-9e04c6720e47?auto=format&fit=crop&w=900&q=80',
    caption: 'Your smile',
    style: 'polaroid',
    rotation: '-rotate-1',
    position: 'top'
  },
  {
    id: 6,
    src: '/photos/photo-6.jpg',
    fallback: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=80',
    caption: 'Favourite memory',
    style: 'portrait',
    rotation: 'rotate-1',
    position: 'center'
  },
  {
    id: 7,
    src: '/photos/photo-7.jpg',
    fallback: 'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?auto=format&fit=crop&w=900&q=80',
    caption: 'Holding onto this',
    style: 'landscape',
    rotation: '-rotate-1',
    position: 'center'
  }
];

export default function App() {
  const [entered, setEntered] = useState(false);
  const [letterText, setLetterText] = useState(DEFAULT_LETTER);
  const [photos, setPhotos] = useState(INITIAL_PHOTOS);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [showFinalNote, setShowFinalNote] = useState(false);
  const [studioOpen, setStudioOpen] = useState(false);
  const [parulViewMode, setParulViewMode] = useState(true); // Set to true so Parul doesn't see edit buttons by default
  const [isPlaying, setIsPlaying] = useState(false);

  const audioCtxRef = useRef(null);
  const intervalRef = useRef(null);

  // Load saved customizations carefully, never overwriting with empty text
  useEffect(() => {
    try {
      const savedLetter = localStorage.getItem('parul_apology_letter_v2');
      if (savedLetter && savedLetter.trim().length > 20) {
        setLetterText(savedLetter);
      }
      const savedPhotos = localStorage.getItem('parul_apology_photos_v2');
      if (savedPhotos) {
        const parsed = JSON.parse(savedPhotos);
        if (Array.isArray(parsed) && parsed.length === 7) {
          setPhotos(parsed);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') setLightboxIndex((prev) => (prev + 1) % photos.length);
      if (e.key === 'ArrowLeft') setLightboxIndex((prev) => (prev - 1 + photos.length) % photos.length);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, photos.length]);

  // Gentle Web Audio ambient piano chords
  const toggleMusic = () => {
    if (isPlaying) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      setIsPlaying(false);
      return;
    }

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;

    const chords = [
      [261.63, 329.63, 392.0, 493.88], // Cmaj7
      [220.0, 261.63, 329.63, 392.0],  // Am7
      [174.61, 220.0, 261.63, 349.23], // Fmaj7
      [196.0, 246.94, 293.66, 392.0]   // G
    ];
    let chordIdx = 0;

    const playChord = () => {
      if (!audioCtxRef.current) return;
      const now = ctx.currentTime;
      const notes = chords[chordIdx % chords.length];
      chordIdx++;

      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.12);

        gain.gain.setValueAtTime(0.0001, now + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.025, now + i * 0.12 + 0.6);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.12 + 3.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 3.5);
      });
    };

    playChord();
    intervalRef.current = setInterval(playChord, 3800);
    setIsPlaying(true);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  const handleResetDefaults = () => {
    localStorage.removeItem('parul_apology_letter_v2');
    localStorage.removeItem('parul_apology_photos_v2');
    setLetterText(DEFAULT_LETTER);
    setPhotos(INITIAL_PHOTOS);
  };

  const handlePhotoUpload = (id, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const updated = photos.map((p) => (p.id === id ? { ...p, src: e.target.result } : p));
      setPhotos(updated);
      try {
        localStorage.setItem('parul_apology_photos_v2', JSON.stringify(updated));
      } catch (err) {
        console.warn('Storage limit reached for local preview');
      }
    };
    reader.readAsDataURL(file);
  };

  const updatePhotoCaption = (id, caption) => {
    const updated = photos.map((p) => (p.id === id ? { ...p, caption } : p));
    setPhotos(updated);
    localStorage.setItem('parul_apology_photos_v2', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-[#FDF8F5] text-stone-800 relative overflow-x-hidden selection:bg-rose-200 selection:text-rose-950">
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');
        .font-serif-editorial { font-family: 'Cormorant Garamond', Georgia, serif; }
        .font-sans-clean { font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(4deg); }
        }
        .animate-float-slow { animation: floatSlow 6s ease-in-out infinite; }
      `}</style>

      {/* Subtle Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-rose-200/30 blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-96 h-96 rounded-full bg-amber-100/40 blur-3xl" />
        <div className="absolute bottom-10 left-1/4 w-80 h-80 rounded-full bg-rose-100/40 blur-3xl" />
      </div>

      {/* Floating Top Bar */}
      <header className="fixed top-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-none max-w-6xl mx-auto">
        <button
          onClick={toggleMusic}
          aria-label={isPlaying ? 'Pause ambient music' : 'Play ambient music'}
          className="pointer-events-auto flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/85 backdrop-blur-md border border-rose-200/60 shadow-sm text-xs font-sans-clean text-stone-700 hover:bg-rose-50 transition"
        >
          {isPlaying ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
              <span>Piano On</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-stone-400" />
              <span>Soft Piano</span>
            </>
          )}
        </button>

        {!parulViewMode && (
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              onClick={() => setStudioOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/85 backdrop-blur-md border border-rose-200/60 shadow-sm text-xs font-sans-clean text-stone-700 hover:bg-rose-50 transition"
            >
              <Camera className="w-3.5 h-3.5 text-rose-600" />
              <span>Customize Letter & Photos</span>
            </button>
            <button
              onClick={() => setParulViewMode(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-rose-900 text-white shadow-sm text-xs font-sans-clean hover:bg-rose-800 transition"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Parul View</span>
            </button>
          </div>
        )}
      </header>

      {/* 1. OPENING WELCOME SCREEN */}
      {!entered ? (
        <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 text-center">
          <div className="max-w-lg mx-auto bg-white/70 backdrop-blur-xl border border-rose-100/80 rounded-3xl p-8 md:p-12 shadow-[0_20px_60px_-15px_rgba(159,18,57,0.08)]">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-50 border border-rose-100 mb-6 animate-float-slow">
              <Heart className="w-5 h-5 text-rose-600 fill-rose-500" />
            </div>

            <h1 className="font-serif-editorial text-4xl md:text-6xl font-medium text-stone-900 tracking-tight mb-3">
              Hey, Parul… <span className="text-rose-600">❤️</span>
            </h1>

            <p className="font-serif-editorial italic text-xl md:text-2xl text-stone-600 mb-8">
              I made something for you.
            </p>

            <button
              onClick={() => {
                setEntered(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group relative inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-rose-900 text-rose-50 font-sans-clean text-sm font-medium tracking-wide shadow-md hover:bg-rose-800 hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
            >
              <span>Open my heart</span>
              <Heart className="w-4 h-4 text-rose-200 fill-rose-200 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </main>
      ) : (
        /* MAIN EXPERIENCE — TIGHT, CONTINUOUS EDITORIAL FLOW */
        <main className="relative z-10 font-sans-clean">
          {/* 2. APOLOGY LETTER SECTION */}
          <section className="pt-16 pb-8 md:pt-20 md:pb-10 px-4 sm:px-6 max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-100/70 border border-rose-200/60 text-[11px] uppercase tracking-widest text-rose-900 font-medium mb-3">
                <Sparkles className="w-3 h-3 text-rose-600" /> A Personal Note For You
              </span>
              <h1 className="font-serif-editorial text-4xl sm:text-5xl md:text-6xl font-medium text-stone-900 tracking-tight">
                I'm Sorry, Parul
              </h1>
              <div className="mt-2 flex items-center justify-center gap-2 text-rose-400">
                <span className="w-8 h-[1px] bg-rose-200" />
                <Heart className="w-3.5 h-3.5 fill-rose-400" />
                <span className="w-8 h-[1px] bg-rose-200" />
              </div>
            </div>

            {/* Letter Card */}
            <article className="relative bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-10 md:p-12 border border-rose-100 shadow-[0_15px_50px_-12px_rgba(136,19,55,0.07)]">
              <div className="space-y-4 text-stone-700 text-[15px] sm:text-base md:text-[17px] leading-relaxed whitespace-pre-line font-normal">
                {letterText}
              </div>
            </article>
          </section>

          {/* 3. SEVEN-PHOTO SCRAPBOOK GALLERY (NO BIG GAP!) */}
          <section className="pt-6 pb-12 md:pt-8 md:pb-16 px-4 sm:px-6 max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="font-serif-editorial text-3xl sm:text-4xl md:text-5xl font-medium text-stone-900">
                A few moments worth remembering
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-1.5">
                Tap any photograph to view it full screen
              </p>
            </div>

            {/* Row 1: 2 Featured Photos */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-7 items-center mb-6 md:mb-8">
              {/* Photo 1 */}
              <div className="md:col-span-7">
                <PhotoCard
                  photo={photos[0]}
                  index={0}
                  aspectClass="aspect-[4/3]"
                  onOpen={() => setLightboxIndex(0)}
                />
              </div>
              {/* Photo 2 */}
              <div className="md:col-span-5">
                <PhotoCard
                  photo={photos[1]}
                  index={1}
                  aspectClass="aspect-[4/5]"
                  onOpen={() => setLightboxIndex(1)}
                />
              </div>
            </div>

            {/* Row 2: 3 Scrapbook / Polaroid Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-7 items-center mb-6 md:mb-8">
              {photos.slice(2, 5).map((photo, idx) => (
                <PhotoCard
                  key={photo.id}
                  photo={photo}
                  index={idx + 2}
                  aspectClass="aspect-[4/5]"
                  arch={idx === 0}
                  onOpen={() => setLightboxIndex(idx + 2)}
                />
              ))}
            </div>

            {/* Row 3: 2 Closing Memories */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-7 items-center">
              {/* Photo 6 */}
              <div className="md:col-span-5">
                <PhotoCard
                  photo={photos[5]}
                  index={5}
                  aspectClass="aspect-[4/5]"
                  onOpen={() => setLightboxIndex(5)}
                />
              </div>
              {/* Photo 7 */}
              <div className="md:col-span-7">
                <PhotoCard
                  photo={photos[6]}
                  index={6}
                  aspectClass="aspect-[4/3]"
                  onOpen={() => setLightboxIndex(6)}
                />
              </div>
            </div>
          </section>

          {/* 4. INTERACTIVE APOLOGY REFLECTION MOMENT */}
          <section className="py-10 md:py-14 px-4 sm:px-6 max-w-xl mx-auto text-center">
            <div className="bg-white/85 backdrop-blur-md border border-rose-100 rounded-3xl p-7 sm:p-10 shadow-[0_15px_45px_-15px_rgba(136,19,55,0.07)]">
              <h2 className="font-serif-editorial text-2xl sm:text-3xl font-medium text-stone-900 mb-3">
                One thing I want you to know…
              </h2>
              <p className="text-stone-600 text-sm sm:text-base leading-relaxed mb-6">
                “I can't change what happened, but I can take responsibility for my part and do better.”
              </p>

              {!showFinalNote ? (
                <button
                  onClick={() => setShowFinalNote(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-rose-900 text-rose-50 text-xs sm:text-sm font-medium hover:bg-rose-800 transition shadow-sm"
                >
                  <span>Read one last thing</span>
                  <Heart className="w-3.5 h-3.5 fill-rose-200 text-rose-200" />
                </button>
              ) : (
                <div className="mt-4 pt-5 border-t border-rose-100 text-rose-950 bg-rose-50/60 rounded-2xl p-5 transition-all duration-500">
                  <p className="font-serif-editorial italic text-xl sm:text-2xl leading-relaxed">
                    “I’m sorry, Parul. No pressure to reply or forgive me right away. I just wanted you to know that I mean it.”
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-widest text-rose-700 font-medium">
                    — Always respecting your space, Ansh
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* 5. RESPECTFUL FOOTER */}
          <footer className="pb-12 pt-4 text-center text-xs text-stone-400">
            <p className="flex items-center justify-center gap-1.5">
              Made with honesty & care for Parul <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
            </p>
          </footer>
        </main>
      )}

      {/* LIGHTBOX MODAL */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            onClick={() => setLightboxIndex(null)}
            aria-label="Close photo viewer"
            className="absolute top-5 right-5 p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((lightboxIndex - 1 + photos.length) % photos.length);
            }}
            aria-label="Previous photo"
            className="absolute left-3 sm:left-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div
            className="max-w-3xl max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={photos[lightboxIndex].src}
              onError={(e) => {
                e.currentTarget.src = photos[lightboxIndex].fallback;
              }}
              alt={photos[lightboxIndex].caption || `Memory ${lightboxIndex + 1}`}
              className="max-h-[75vh] w-auto object-contain rounded-xl shadow-2xl border border-white/15"
            />
            <div className="mt-3 text-center">
              <p className="font-serif-editorial italic text-lg text-rose-100">
                {photos[lightboxIndex].caption || `Moment #${lightboxIndex + 1}`}
              </p>
              <p className="text-[11px] text-stone-400 mt-0.5">
                {lightboxIndex + 1} of {photos.length}
              </p>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((lightboxIndex + 1) % photos.length);
            }}
            aria-label="Next photo"
            className="absolute right-3 sm:right-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* STUDIO MODAL (OPTIONAL IN-BROWSER CUSTOMIZER) */}
      {studioOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-rose-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <h3 className="font-serif-editorial text-2xl font-medium text-stone-900">
                Customize Letter & 7 Photos
              </h3>
              <button
                onClick={() => setStudioOpen(false)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-5">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-stone-500 mb-2">
                  Apology Letter Text
                </label>
                <textarea
                  rows={6}
                  value={letterText}
                  onChange={(e) => {
                    setLetterText(e.target.value);
                    localStorage.setItem('parul_apology_letter_v2', e.target.value);
                  }}
                  className="w-full rounded-xl border border-stone-200 p-3 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider text-stone-500">
                    7 Memory Photos
                  </span>
                  <button
                    onClick={handleResetDefaults}
                    className="inline-flex items-center gap-1 text-xs text-rose-700 hover:underline"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset to Default GitHub Photos
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {photos.map((p, idx) => (
                    <div key={p.id} className="p-3 rounded-xl border border-stone-200 flex gap-3 items-center">
                      <img
                        src={p.src}
                        onError={(e) => {
                          e.currentTarget.src = p.fallback;
                        }}
                        alt=""
                        className="w-14 h-14 rounded-lg object-cover bg-stone-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          value={p.caption}
                          onChange={(e) => updatePhotoCaption(p.id, e.target.value)}
                          placeholder={`Moment #${idx + 1}`}
                          className="w-full text-xs border-b border-stone-200 pb-1 mb-1.5 focus:outline-none focus:border-rose-400"
                        />
                        <label className="inline-block text-[11px] text-rose-700 font-medium cursor-pointer hover:underline">
                          Replace File
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handlePhotoUpload(p.id, e.target.files?.[0])}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-100 flex justify-end">
              <button
                onClick={() => setStudioOpen(false)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-rose-900 text-white text-xs font-medium hover:bg-rose-800"
              >
                <Check className="w-4 h-4" /> Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PhotoCard({ photo, index, aspectClass, arch = false, onOpen }) {
  const objectPos =
    photo.position === 'top'
      ? 'object-top'
      : photo.position === 'bottom'
      ? 'object-bottom'
      : 'object-center';

  return (
    <div
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onOpen();
      }}
      className={`group relative bg-white p-3 sm:p-3.5 pb-4 rounded-2xl border border-rose-100/90 shadow-[0_12px_35px_-12px_rgba(136,19,55,0.1)] hover:shadow-[0_20px_45px_-12px_rgba(136,19,55,0.18)] transition-all duration-300 cursor-pointer ${photo.rotation} hover:rotate-0 hover:-translate-y-1`}
    >
      {/* Subtle Washi Tape Accent */}
      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-16 h-5 bg-rose-100/70 backdrop-blur-xs rounded-xs border border-rose-200/40 rotate-1 pointer-events-none" />

      <div
        className={`relative w-full ${aspectClass} overflow-hidden bg-stone-100 ${
          arch ? 'rounded-t-[120px] rounded-b-xl' : 'rounded-xl'
        }`}
      >
        <img
          src={photo.src}
          onError={(e) => {
            e.currentTarget.src = photo.fallback;
          }}
          alt={photo.caption || `Memory ${index + 1}`}
          loading="lazy"
          className={`w-full h-full object-cover ${objectPos} group-hover:scale-[1.03] transition-transform duration-500`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-3">
          <span className="p-1.5 rounded-full bg-white/85 text-stone-800 shadow-xs">
            <Maximize2 className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      <div className="mt-2.5 px-1 flex items-center justify-between text-xs text-stone-500">
        <span className="font-serif-editorial italic text-sm text-stone-700 truncate">
          {photo.caption || `Moment #${index + 1}`}
        </span>
        <Heart className="w-3.5 h-3.5 text-rose-400 group-hover:fill-rose-500 group-hover:text-rose-500 transition-colors shrink-0" />
      </div>
    </div>
  );
}
