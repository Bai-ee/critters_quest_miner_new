import { useEffect, useRef, useState, useCallback } from 'react';
import { SOUND_VOLUMES } from '@/lib/audioVolumes';

interface AudioConfig {
  volume?: number;
  loop?: boolean;
}

class AudioManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private bgMusic: HTMLAudioElement | null = null;
  private isMuted: boolean = false;
  private volume: number = 1.0;
  private activeSounds: Set<HTMLAudioElement> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      // Preload all audio files - use .mp3 where available
      this.loadSound('click', '/audio/CLICK_onClick.mp3');
      this.loadSound('selectTile', '/audio/select_tile.mp3');
      this.loadSound('deselectTile', '/audio/deselect_tile.mp3');
      // revealWinner sound file doesn't exist, skip loading to avoid 404 errors
      // this.loadSound('revealWinner', '/audio/reveal_winner.wav');
      this.loadSound('timerStarts', '/audio/timer_starts.wav'); // No .mp3 version available
      this.loadSound('claimSuccess', '/audio/CLAIM_onSuccess.wav'); // No .mp3 version available
      this.loadSound('mineSignWallet', '/audio/mine_sign_wallet.wav'); // No .mp3 version available
      this.loadSound('mining', '/audio/mining.wav'); // No .mp3 version available
      
      // Load background music
      this.bgMusic = new Audio('/audio/bg.mp3');
      this.bgMusic.loop = true;
      this.bgMusic.volume = SOUND_VOLUMES.backgroundMusic;
    }
  }

  private loadSound(name: string, path: string) {
    const audio = new Audio(path);
    audio.preload = 'auto';
    this.sounds.set(name, audio);
  }

  playSound(name: string, config: AudioConfig = {}, forcePlay: boolean = false) {
    // Don't play any sounds if muted - this prevents new sounds from starting
    // Unless forcePlay is true (for sounds that should play regardless of mute state)
    if (this.isMuted && !forcePlay) {
      return;
    }
    
    const sound = this.sounds.get(name);
    if (sound) {
      const audio = sound.cloneNode() as HTMLAudioElement;
      audio.volume = (config.volume ?? 1.0) * this.volume;
      audio.loop = config.loop ?? false;
      
      // Track this sound instance (including looping sounds)
      this.activeSounds.add(audio);
      
      // Remove from tracking when sound ends (only for non-looping sounds)
      if (!audio.loop) {
        audio.addEventListener('ended', () => {
          this.activeSounds.delete(audio);
        });
      }
      
      // Check if muted before playing (unless forcePlay)
      if (this.isMuted && !forcePlay) {
        this.activeSounds.delete(audio);
        return;
      }
      
      audio.play().catch(err => {
        console.warn(`Failed to play sound ${name}:`, err);
        this.activeSounds.delete(audio);
      });
    }
  }

  playBackgroundMusic() {
    if (this.isMuted || !this.bgMusic) return;
    this.bgMusic.play().catch(err => {
      console.warn('Failed to play background music:', err);
    });
  }

  stopBackgroundMusic() {
    if (this.bgMusic) {
      this.bgMusic.pause();
      this.bgMusic.currentTime = 0;
    }
  }

  stopAllSounds() {
    // Stop all currently playing sound effects (including looping ones)
    this.activeSounds.forEach(audio => {
      try {
        audio.pause();
        audio.currentTime = 0;
        audio.loop = false; // Disable looping on all sounds
        // Remove all event listeners to prevent memory leaks
        audio.onended = null;
      } catch (err) {
        // Ignore errors when stopping sounds
      }
    });
    this.activeSounds.clear();
  }

  setMuted(muted: boolean) {
    const wasMuted = this.isMuted;
    this.isMuted = muted;
    
    if (muted) {
      // Stop background music immediately
      this.stopBackgroundMusic();
      // Stop all currently playing sound effects immediately
      this.stopAllSounds();
    } else {
      // Only play background music if we're transitioning from muted to unmuted
      if (wasMuted) {
        this.playBackgroundMusic();
      }
    }
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.bgMusic) {
      this.bgMusic.volume = SOUND_VOLUMES.backgroundMusic * this.volume;
    }
  }

  getMuted() {
    return this.isMuted;
  }
}

// Singleton instance
let audioManagerInstance: AudioManager | null = null;

function getAudioManager() {
  if (!audioManagerInstance) {
    audioManagerInstance = new AudioManager();
  }
  return audioManagerInstance;
}

export function useAudio() {
  const [isMuted, setIsMutedState] = useState(() => {
    // Always default to muted on page load, regardless of localStorage
    // User must explicitly click to unmute
    return true;
  });

  const managerRef = useRef<AudioManager | null>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    managerRef.current = getAudioManager();
    const manager = managerRef.current;
    
    // Always set to muted on initial mount to ensure button shows inactive state
    if (isInitialMount.current) {
      manager.setMuted(true);
      isInitialMount.current = false;
    } else {
      manager.setMuted(isMuted);
    }
    
    // Don't auto-start background music - wait for user to click unmute
    // This ensures audio only plays after user interaction
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    const newMuted = !isMuted;
    setIsMutedState(newMuted);
    if (managerRef.current) {
      managerRef.current.setMuted(newMuted);
      // If unmuting, start background music
      if (!newMuted) {
        setTimeout(() => {
          managerRef.current?.playBackgroundMusic();
        }, 100);
      }
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('audioMuted', String(newMuted));
    }
  }, [isMuted]);

  const playSound = useCallback((name: string, config?: AudioConfig, forcePlay?: boolean) => {
    if (managerRef.current) {
      managerRef.current.playSound(name, config, forcePlay);
    }
  }, []);

  return {
    isMuted,
    toggleMute,
    playSound,
  };
}

