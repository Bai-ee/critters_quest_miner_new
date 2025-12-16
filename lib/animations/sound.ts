import { Howl } from 'howler';
import { ANIMATION_CONFIG } from './config';

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

const soundCache = new Map<string, Howl>();

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

class SoundManager {
  private masterVolume: number = 1;
  private enabled: boolean = true;
  private muted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      this.enabled = !isMobile;
    }
  }

  setMasterVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    soundCache.forEach((sound) => {
      sound.volume(sound.volume() * this.masterVolume);
    });
  }

  getMasterVolume(): number {
    return this.masterVolume;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

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

  isEnabled(): boolean {
    return this.enabled && !this.muted;
  }

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

  stop(key: keyof typeof SOUND_PATHS) {
    const sound = soundCache.get(key);
    if (sound) {
      sound.stop();
    }
  }

  stopAll() {
    soundCache.forEach((sound) => {
      sound.stop();
    });
  }

  preloadAll() {
    Object.keys(SOUND_PATHS).forEach((key) => {
      initSound(key as keyof typeof SOUND_PATHS);
    });
  }
}

export const soundManager = new SoundManager();

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

export default soundManager;

