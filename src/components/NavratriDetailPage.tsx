import React, { useState, useEffect, useRef, useMemo } from 'react';
import { NAVRATRI_DAYS, NavratriDay } from '../data/navratriData';
import { MandirSeal } from './TempleIcons';
import {
  Volume2,
  Pause,
  Play,
  Square,
  Sparkles,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Share2,
  Check,
} from 'lucide-react';

interface NavratriDetailPageProps {
  initialDayId?: string; // 'day-1' to 'day-9'
  onBackHome: () => void;
  onSelectDayUrl?: (dayId: string) => void;
}

export const NavratriDetailPage: React.FC<NavratriDetailPageProps> = ({
  initialDayId = 'day-1',
  onBackHome,
  onSelectDayUrl,
}) => {
  // Current active day (day-1 to day-9)
  const [selectedDayId, setSelectedDayId] = useState<string>(initialDayId);

  // Audio Playback State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Active word highlight index for karaoke
  const [highlightWordIdx, setHighlightWordIdx] = useState<number>(-1);

  // Speech utterance ref
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isPlayingRef = useRef<boolean>(false);
  const isPausedRef = useRef<boolean>(false);
  const timerFallbackRef = useRef<number | null>(null);

  // Get active day data
  const currentDay: NavratriDay = useMemo(() => {
    return NAVRATRI_DAYS.find((d) => d.id === selectedDayId) || NAVRATRI_DAYS[0];
  }, [selectedDayId]);

  // Synchronize state ref
  useEffect(() => {
    isPlayingRef.current = isPlaying;
    isPausedRef.current = isPaused;
  }, [isPlaying, isPaused]);

  // Split katha into words while retaining positions for accurate karaoke highlighting
  const wordTokens = useMemo(() => {
    const text = currentDay.katha;
    const tokens: { word: string; start: number; end: number; isWord: boolean }[] = [];
    const regex = /\S+|\s+/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      const isWord = /\S/.test(match[0]);
      tokens.push({
        word: match[0],
        start: match.index,
        end: match.index + match[0].length,
        isWord,
      });
    }
    return tokens;
  }, [currentDay.katha]);

  // Stop speech when component unmounts or day changes
  const stopAudio = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (timerFallbackRef.current) {
      window.clearInterval(timerFallbackRef.current);
      timerFallbackRef.current = null;
    }
    setIsPlaying(false);
    setIsPaused(false);
    setHighlightWordIdx(-1);
  };

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  // Update selected day from props
  useEffect(() => {
    if (initialDayId && initialDayId !== selectedDayId) {
      stopAudio();
      setSelectedDayId(initialDayId);
    }
  }, [initialDayId]);

  // Handle Day Change
  const handleSelectDay = (dayId: string) => {
    if (dayId === selectedDayId) return;
    stopAudio();
    setSelectedDayId(dayId);
    if (onSelectDayUrl) {
      onSelectDayUrl(dayId);
    }
    try {
      window.history.pushState(null, '', `#/navratri/${dayId}`);
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Select Hindi Voice (Female Google Hindi preference)
  const getHindiFemaleVoice = (): SpeechSynthesisVoice | null => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();

    // 1. Look for Hindi Female voice (Google हिंदी, Lekha, Kalpana, Veena)
    const femaleHindi = voices.find(
      (v) =>
        (v.lang === 'hi-IN' || v.lang.startsWith('hi')) &&
        (v.name.toLowerCase().includes('female') ||
          v.name.toLowerCase().includes('google') ||
          v.name.includes('हिंदी') ||
          v.name.includes('हिन्दी') ||
          v.name.toLowerCase().includes('lekha') ||
          v.name.toLowerCase().includes('kalpana') ||
          v.name.toLowerCase().includes('veena'))
    );
    if (femaleHindi) return femaleHindi;

    // 2. Any Hindi voice
    const anyHindi = voices.find((v) => v.lang === 'hi-IN' || v.lang.startsWith('hi'));
    if (anyHindi) return anyHindi;

    // 3. Any Indian accented voice
    const anyIndian = voices.find((v) => v.lang.includes('IN'));
    if (anyIndian) return anyIndian;

    return null;
  };

  // Start speaking Katha with karaoke highlight
  const speakKatha = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('आपके ब्राउज़र में आवाज़ (Speech Synthesis) की सुविधा उपलब्ध नहीं है।');
      return;
    }

    // If currently paused, simply resume
    if (isPlaying && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      return;
    }

    // Stop any previous speech
    window.speechSynthesis.cancel();
    if (timerFallbackRef.current) {
      window.clearInterval(timerFallbackRef.current);
      timerFallbackRef.current = null;
    }

    const text = currentDay.katha;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN';
    utterance.rate = playbackSpeed;
    utterance.pitch = 1.0;

    const voice = getHindiFemaleVoice();
    if (voice) {
      utterance.voice = voice;
    }

    let hasBoundaryFired = false;

    // Karaoke highlight via onboundary
    utterance.onboundary = (event) => {
      hasBoundaryFired = true;
      const charIdx = event.charIndex;
      if (charIdx !== undefined && charIdx >= 0) {
        // Find matching word token
        const foundIdx = wordTokens.findIndex(
          (t) => t.isWord && charIdx >= t.start && charIdx <= t.end + 2
        );
        if (foundIdx !== -1) {
          setHighlightWordIdx(foundIdx);
        }
      }
    };

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      setHighlightWordIdx(0);

      // Fallback timer for browsers where Hindi onboundary is silent
      const wordCount = wordTokens.filter((t) => t.isWord).length;
      // Average Hindi speech rate: ~140 words per minute at 1.0x speed
      const msPerWord = (60000 / (140 * playbackSpeed));
      let currentIdx = 0;

      timerFallbackRef.current = window.setInterval(() => {
        if (!hasBoundaryFired && isPlayingRef.current && !isPausedRef.current) {
          currentIdx++;
          // Find next real word index
          while (currentIdx < wordTokens.length && !wordTokens[currentIdx].isWord) {
            currentIdx++;
          }
          if (currentIdx < wordTokens.length) {
            setHighlightWordIdx(currentIdx);
          } else {
            if (timerFallbackRef.current) {
              window.clearInterval(timerFallbackRef.current);
            }
          }
        }
      }, msPerWord);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setHighlightWordIdx(-1);
      if (timerFallbackRef.current) {
        window.clearInterval(timerFallbackRef.current);
        timerFallbackRef.current = null;
      }
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setHighlightWordIdx(-1);
      if (timerFallbackRef.current) {
        window.clearInterval(timerFallbackRef.current);
        timerFallbackRef.current = null;
      }
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Pause / Resume speech
  const pauseOrResumeAudio = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (!isPlaying) {
      speakKatha();
      return;
    }

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  // Change Playback Speed
  const handleSpeedChange = (newSpeed: number) => {
    setPlaybackSpeed(newSpeed);
    if (isPlaying) {
      // Re-trigger speech with new speed seamlessly
      stopAudio();
      setTimeout(() => {
        const text = currentDay.katha;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'hi-IN';
        utterance.rate = newSpeed;
        utterance.pitch = 1.0;
        const voice = getHindiFemaleVoice();
        if (voice) utterance.voice = voice;
        utterance.onend = () => {
          setIsPlaying(false);
          setIsPaused(false);
          setHighlightWordIdx(-1);
        };
        utterance.onboundary = (e) => {
          const charIdx = e.charIndex;
          const foundIdx = wordTokens.findIndex(
            (t) => t.isWord && charIdx >= t.start && charIdx <= t.end + 2
          );
          if (foundIdx !== -1) {
            setHighlightWordIdx(foundIdx);
          }
        };
        utteranceRef.current = utterance;
        setIsPlaying(true);
        setIsPaused(false);
        window.speechSynthesis.speak(utterance);
      }, 50);
    }
  };

  // Copy Page Link
  const handleShareLink = () => {
    const url = `${window.location.origin}/#/navratri/${selectedDayId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Navigation Prev / Next
  const currentIndex = NAVRATRI_DAYS.findIndex((d) => d.id === selectedDayId);
  const prevDay = currentIndex > 0 ? NAVRATRI_DAYS[currentIndex - 1] : null;
  const nextDay = currentIndex < NAVRATRI_DAYS.length - 1 ? NAVRATRI_DAYS[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-[#fffbf2] text-stone-900 pb-20 selection:bg-amber-200 selection:text-[#7a0000]">
      {/* Top Banner Ribbon */}
      <div className="bg-[#7a0000] text-amber-100 py-3 px-4 border-b-2 border-[#FFD700] shadow-md sticky top-18 z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={onBackHome}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-200 hover:text-white transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← मुख्य पृष्ठ (Home)</span>
          </button>

          <div className="flex items-center gap-2 text-xs sm:text-sm text-[#FFD700] font-heading font-bold">
            <Sparkles className="w-4 h-4 text-[#ff9933]" />
            <span>नवरात्र पावन कथा (9 स्वरूप)</span>
          </div>

          <button
            onClick={handleShareLink}
            className="flex items-center gap-1 text-xs bg-white/10 hover:bg-white/20 text-amber-200 px-2.5 py-1 rounded-lg border border-amber-500/30 transition cursor-pointer"
            title="कथा लिंक कॉपी करें"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">कॉपी हुआ!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">शेयर करें</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* 9 CARDS SELECTOR: Horizontal scrollable cards for all 9 days */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-amber-200">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#7a0000] flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-[#ff9933]" />
              <span>नवदुर्गा के 9 पावन स्वरूप (कथा चयन करें)</span>
            </h2>
            <span className="text-[11px] text-stone-500 font-mono">
              दिन {currentDay.dayNumber} / 9
            </span>
          </div>

          {/* 9 Cards Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
            {NAVRATRI_DAYS.map((day) => {
              const isSelected = day.id === selectedDayId;
              return (
                <button
                  key={day.id}
                  onClick={() => handleSelectDay(day.id)}
                  className={`p-2.5 sm:p-3 rounded-2xl text-center transition cursor-pointer flex flex-col items-center justify-center gap-1 border ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#7a0000] to-[#590000] text-[#FFD700] border-[#FFD700] shadow-md ring-2 ring-amber-400/50 scale-102'
                      : 'bg-amber-50/60 hover:bg-amber-100/70 text-stone-800 border-amber-200 hover:border-amber-400'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                      isSelected
                        ? 'bg-[#FFD700] text-[#7a0000]'
                        : 'bg-white text-stone-700 border border-amber-300'
                    }`}
                  >
                    {day.dayNumber}
                  </div>
                  <div className="text-[11px] sm:text-xs font-bold font-heading line-clamp-1">
                    {day.name}
                  </div>
                  <div
                    className={`text-[10px] leading-tight ${
                      isSelected ? 'text-amber-200' : 'text-stone-500'
                    }`}
                  >
                    {day.hindiDay}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* DETAIL PAGE TOP: 2 BUTTONS [🔊 कथा सुनें] [⏸️ रोकें] + SPEED CONTROLS */}
        <div className="bg-gradient-to-r from-[#7a0000] via-[#8c0000] to-[#6b0000] text-white rounded-3xl p-5 sm:p-6 shadow-xl border-2 border-[#FFD700] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FFD700]/20 border border-[#FFD700] flex items-center justify-center text-[#FFD700] shrink-0">
                <MandirSeal size={32} />
              </div>
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFD700] text-[#7a0000] mb-1">
                  {currentDay.hindiDay}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
                  {currentDay.name} की पावन कथा
                </h1>
                <p className="text-xs text-amber-200 mt-0.5">{currentDay.subtitle}</p>
              </div>
            </div>

            {/* LIVE AUDIO STATUS BADGE */}
            {isPlaying && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 border border-[#FFD700]/60 self-start sm:self-auto">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-amber-200 font-medium">
                  {isPaused ? 'कथा रुकी हुई है' : 'कथा चल रही है...'}
                </span>
              </div>
            )}
          </div>

          {/* AUDIO CONTROLLER BAR: EXACT USER SPECIFICATION:
              1. Detail Page Top pe 2 Button: [🔊 कथा सुनें] [⏸️ रोकें]
              2. Speed: [1x] [1.5x] [2x]
              3. Stop Button: speechSynthesis.cancel() */}
          <div className="bg-black/30 rounded-2xl p-4 border border-amber-500/30 flex flex-wrap items-center justify-between gap-4">
            {/* Left: Main Play / Pause / Stop Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Button 1: [🔊 कथा सुनें] */}
              <button
                onClick={speakKatha}
                disabled={isPlaying && !isPaused}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer shadow-md ${
                  isPlaying && !isPaused
                    ? 'bg-amber-300/40 text-stone-300 cursor-not-allowed border border-amber-400/20'
                    : 'bg-gradient-to-r from-[#FFD700] to-[#ff9933] hover:from-[#ffe033] hover:to-[#ffaa4d] text-stone-950 border border-amber-300 font-extrabold hover:scale-102 active:scale-98'
                }`}
                title="कथा हिंदी में सुनें"
              >
                <Volume2 className="w-4 h-4 text-stone-950" />
                <span>🔊 कथा सुनें</span>
              </button>

              {/* Button 2: [⏸️ रोकें] / [▶️ जारी रखें] */}
              <button
                onClick={pauseOrResumeAudio}
                disabled={!isPlaying}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer border ${
                  !isPlaying
                    ? 'bg-white/5 text-stone-400 border-white/10 cursor-not-allowed'
                    : isPaused
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-400 shadow-md animate-pulse'
                    : 'bg-white/20 hover:bg-white/30 text-white border-white/30 shadow-md'
                }`}
                title={isPaused ? 'कथा पुनः जारी रखें' : 'कथा को रोकें (Pause)'}
              >
                {isPaused ? (
                  <>
                    <Play className="w-4 h-4 fill-current text-white" />
                    <span>▶️ जारी रखें</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-4 h-4 fill-current text-amber-200" />
                    <span>⏸️ रोकें</span>
                  </>
                )}
              </button>

              {/* Stop Button */}
              {isPlaying && (
                <button
                  onClick={stopAudio}
                  className="px-3.5 py-2.5 rounded-xl bg-red-600/80 hover:bg-red-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer border border-red-400 shadow-md"
                  title="कथा पूर्ण रूप से बंद करें"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>बंद करें</span>
                </button>
              )}
            </div>

            {/* Right: Speed Controls [1x] [1.5x] [2x] */}
            <div className="flex items-center gap-1.5 bg-black/40 p-1.5 rounded-xl border border-amber-500/20">
              <span className="text-[11px] text-amber-200 font-bold px-1.5">गति (Speed):</span>
              {[1.0, 1.5, 2.0].map((s) => (
                <button
                  key={s}
                  onClick={() => handleSpeedChange(s)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition cursor-pointer ${
                    playbackSpeed === s
                      ? 'bg-[#FFD700] text-stone-950 shadow-sm'
                      : 'bg-white/10 hover:bg-white/20 text-stone-200'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* KATHA TEXT DISPLAY CARD (NO DATE, NO MANTRA, NO AARTI - ONLY KATHA + KARAOKE HIGHLIGHT) */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-stone-200 space-y-6">
          {/* Header of Katha */}
          <div className="border-b border-amber-100 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff9933]" />
              <h2 className="text-lg sm:text-xl font-bold font-heading text-[#7a0000]">
                {currentDay.name} - पावन व्रत कथा
              </h2>
            </div>
            {isPlaying && (
              <span className="text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 font-medium">
                🟡 पीला रंग वर्तमान में बोले जा रहे शब्द को दर्शाता है (Karaoke)
              </span>
            )}
          </div>

          {/* Sacred Katha Paragraphs with Real-Time Word Highlighting */}
          <div className="text-stone-800 text-base sm:text-lg leading-relaxed sm:leading-loose font-serif">
            {wordTokens.map((token, idx) => {
              if (!token.isWord) {
                // Return whitespace / newlines
                return <span key={idx}>{token.word}</span>;
              }

              const isHighlighted = isPlaying && highlightWordIdx === idx;

              return (
                <span
                  key={idx}
                  className={`transition-colors duration-150 inline-block ${
                    isHighlighted
                      ? 'bg-yellow-300 text-stone-950 font-bold px-1.5 py-0.5 rounded-md shadow-xs scale-105 border border-yellow-500'
                      : ''
                  }`}
                >
                  {token.word}
                </span>
              );
            })}
          </div>

          {/* Footer of Katha Card with Prev / Next Navigation */}
          <div className="pt-6 border-t border-stone-200 flex flex-wrap items-center justify-between gap-4">
            {prevDay ? (
              <button
                onClick={() => handleSelectDay(prevDay.id)}
                className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-[#7a0000] text-xs sm:text-sm font-bold border border-amber-200 flex items-center gap-1.5 transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>पिछला दिन: {prevDay.name}</span>
              </button>
            ) : (
              <div />
            )}

            {nextDay ? (
              <button
                onClick={() => handleSelectDay(nextDay.id)}
                className="px-4 py-2 rounded-xl bg-[#7a0000] hover:bg-[#990000] text-[#FFD700] text-xs sm:text-sm font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
              >
                <span>अगला दिन: {nextDay.name}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <div />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
