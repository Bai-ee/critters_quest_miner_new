/**
 * Sound Manager
 * 
 * Centralized sound effect management using Howler.js
 * Provides easy-to-use functions for playing game sounds.
 */

import { Howl } from 'howler';
import { ANIMATION_CONFIG } from './config';

// Sound file paths (to be added when sound files are available)
const SOUND_PATHS = {
  hover: '/sounds/hover.mp3',
  click: '/sounds/click.mp3',
  success: '/sounds/success.mp3',
  error: '/sounds/error.mp3',
  deploy: '/sounds/deploy.mp3',
  claim: '/sounds/claim.mp3',
  winner: '/sounds/winner.mp3',
  ambient: '/sounds/ambient.mp3',
} as const;

// Sound instances cache
const soundCache = new Map<string, Howl>();

/**
 * Initialize a sound
 */
function initSound(
  key: keyof typeof SOUND_PATHS,
  options: { volume?: number; loop?: boolean } = {}
): Howl {
  const cached = soundCache.get(key);
  if (cached) return cached;

  const sound = new Howl({
    src: [SOUND_PATHS[key]],
    volume: options.volume ?? ANIMATION_CONFIG.sound.volume.hover,
    loop: options.loop ?? false,
    preload: true,
    html5: false, // Use Web Audio API for better performance
  });

  soundCache.set(key, sound);
  return sound;
}

/**
 * Sound Manager Class
 */
class SoundManager {
  private masterVolume: number = 1;
  private enabled: boolean = true;
  private muted: boolean = false;

  constructor() {
    // Check if sounds should be enabled (user preference, mobile, etc.)
    if (typeof window !== 'undefined') {
      // Disable by default on mobile to save battery/data
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      this.enabled = !isMobile;
    }
  }

  /**
   * Set master volume (0-1)
   */
  setMasterVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    soundCache.forEach((sound) => {
      sound.volume(sound.volume() * this.masterVolume);
    });
  }

  /**
   * Get master volume
   */
  getMasterVolume(): number {
    return this.masterVolume;
  }

  /**
   * Enable/disable sounds
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  /**
   * Mute/unmute sounds
   */
  setMuted(muted: boolean) {
    this.muted = muted;
    soundCache.forEach((sound) => {
      if (muted) {
        sound.mute(true);
      } else {
        sound.mute(false);
      }
    });
  }

  /**
   * Check if sounds are enabled
   */
  isEnabled(): boolean {
    return this.enabled && !this.muted;
  }

  /**
   * Play a sound effect
   */
  play(
    key: keyof typeof SOUND_PATHS,
    options: {
      volume?: number;
      delay?: number;
      onEnd?: () => void;
    } = {}
  ): number | null {
    if (!this.isEnabled()) return null;

    try {
      const sound = initSound(key, {
        volume: options.volume ?? ANIMATION_CONFIG.sound.volume.hover,
      });

      const volume = (options.volume ?? ANIMATION_CONFIG.sound.volume.hover) * this.masterVolume;
      sound.volume(volume);

      const soundId = sound.play();

      if (options.onEnd && soundId !== undefined) {
        sound.once('end', options.onEnd, soundId);
      }

      return soundId ?? null;
    } catch (error) {
      console.warn(`Failed to play sound: ${key}`, error);
      return null;
    }
  }

  /**
   * Stop a sound
   */
  stop(key: keyof typeof SOUND_PATHS) {
    const sound = soundCache.get(key);
    if (sound) {
      sound.stop();
    }
  }

  /**
   * Stop all sounds
   */
  stopAll() {
    soundCache.forEach((sound) => {
      sound.stop();
    });
  }

  /**
   * Preload all sounds
   */
  preloadAll() {
    Object.keys(SOUND_PATHS).forEach((key) => {
      initSound(key as keyof typeof SOUND_PATHS);
    });
  }
}

// Export singleton instance
export const soundManager = new SoundManager();

// Convenience functions
export const playHoverSound = () => {
  soundManager.play('hover', {
    volume: ANIMATION_CONFIG.sound.volume.hover,
    delay: ANIMATION_CONFIG.sound.delay,
  });
};

export const playClickSound = () => {
  soundManager.play('click', {
    volume: ANIMATION_CONFIG.sound.volume.click,
    delay: ANIMATION_CONFIG.sound.delay,
  });
};

export const playSuccessSound = () => {
  soundManager.play('success', {
    volume: ANIMATION_CONFIG.sound.volume.success,
  });
};

export const playErrorSound = () => {
  soundManager.play('error', {
    volume: ANIMATION_CONFIG.sound.volume.error,
  });
};

export const playDeploySound = () => {
  soundManager.play('deploy', {
    volume: ANIMATION_CONFIG.sound.volume.click,
  });
};

export const playClaimSound = () => {
  soundManager.play('claim', {
    volume: ANIMATION_CONFIG.sound.volume.success,
  });
};

export const playWinnerSound = () => {
  soundManager.play('winner', {
    volume: ANIMATION_CONFIG.sound.volume.success,
  });
};

// Export for use in components
export default soundManager;

