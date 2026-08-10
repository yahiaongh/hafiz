import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Repeat,
  Headphones,
  Music,
} from 'lucide-react';
import { useLanguage } from '../LanguageContext';

interface AyahAudioPlayerProps {
  audioNumber: number;
  ayahText?: string;
  compact?: boolean;
}

export const AyahAudioPlayer: React.FC<AyahAudioPlayerProps> = ({
  audioNumber,
  ayahText,
  compact = false,
}) => {
  const { t } = useLanguage();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isLooping, setIsLooping] = useState(false);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState(false);

  const audioUrl = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${audioNumber}.mp3`;

  useEffect(() => {
    // Reset player state on Ayah change
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [audioNumber]);

  const initAudio = () => {
    if (!audioRef.current) {
      const audio = new Audio(audioUrl);
      audio.playbackRate = playbackSpeed;
      audio.volume = isMuted ? 0 : volume;
      audio.loop = isLooping;

      audio.onloadedmetadata = () => {
        setDuration(audio.duration);
      };

      audio.ontimeupdate = () => {
        setCurrentTime(audio.currentTime);
      };

      audio.onended = () => {
        if (!audio.loop) {
          setIsPlaying(false);
          setCurrentTime(0);
        }
      };

      audioRef.current = audio;
    }
  };

  const togglePlay = () => {
    initAudio();
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.error('Audio play error:', err));
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const toggleLoop = () => {
    const nextLoop = !isLooping;
    setIsLooping(nextLoop);
    if (audioRef.current) {
      audioRef.current.loop = nextLoop;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (audioRef.current) {
      audioRef.current.volume = nextMuted ? 0 : volume;
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (compact) {
    return (
      <div className="inline-flex items-center gap-2 bg-emerald-50/80 dark:bg-slate-800 p-2 rounded-2xl border border-emerald-100 dark:border-slate-700">
        <button
          onClick={togglePlay}
          className={`p-2.5 rounded-xl transition-all cursor-pointer ${
            isPlaying
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200 dark:shadow-none'
              : 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
          }`}
          title={isPlaying ? t('pauseRecitation') : t('playRecitation')}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-300 pr-2 rtl:pr-0 rtl:pl-2">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-emerald-900 via-emerald-850 to-teal-900 text-white p-5 rounded-3xl shadow-xl space-y-4 relative overflow-hidden border border-emerald-700/50">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/10 backdrop-blur-xs rounded-2xl text-emerald-300">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold tracking-wide text-emerald-100 flex items-center gap-2">
              <span>{t('audioRecitation')}</span>
              <span className="text-[10px] bg-emerald-500/30 px-2 py-0.5 rounded-full text-emerald-200 border border-emerald-400/20 font-medium">
                128kbps
              </span>
            </h4>
            <p className="text-xs text-emerald-300/80">{t('reciterName')}</p>
          </div>
        </div>

        {/* Speed & Loop Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLoop}
            className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              isLooping
                ? 'bg-amber-400 text-emerald-950 shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-emerald-200'
            }`}
            title={t('repeatAudio')}
          >
            <Repeat className="w-3.5 h-3.5" />
            <span className="text-[11px]">{t('repeatAudio')}</span>
          </button>

          <div className="flex items-center bg-white/10 rounded-xl p-1 gap-1">
            {[0.75, 1, 1.25].map((speed) => (
              <button
                key={speed}
                onClick={() => handleSpeedChange(speed)}
                className={`px-2 py-1 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer ${
                  playbackSpeed === speed
                    ? 'bg-emerald-400 text-emerald-950'
                    : 'text-emerald-200 hover:text-white'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Playback Bar & Progress */}
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <button
            onClick={togglePlay}
            className={`p-3.5 rounded-2xl font-bold transition-all cursor-pointer shadow-lg shrink-0 flex items-center justify-center ${
              isPlaying
                ? 'bg-amber-400 text-emerald-950 scale-105'
                : 'bg-emerald-400 hover:bg-emerald-300 text-emerald-950'
            }`}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-emerald-950" />
            ) : (
              <Play className="w-5 h-5 fill-emerald-950 ml-0.5" />
            )}
          </button>

          <div className="flex-1 space-y-1">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-300"
            />
            <div className="flex justify-between text-[11px] text-emerald-200/80 font-mono">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={toggleMute}
              className="p-2 text-emerald-200 hover:text-white transition-colors cursor-pointer"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-red-300" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-300 hidden sm:block"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
