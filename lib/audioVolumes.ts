/**
 * Centralized sound volume configuration
 * Adjust all sound volumes here for easy tweaking
 */

export const SOUND_VOLUMES = {
  // Background music
  backgroundMusic: 0.33,

  // UI interaction sounds
  click: 0.67,
  selectTile: 0.447,
  deselectTile: 0.67,

  // Game event sounds
  revealWinner: 1.0, // Max volume is 1.0, was 1.15 which caused errors
  claimSuccess: 0.5,
  timerStarts: 1.0,
  mineSignWallet: 0.67,

  // Animation sounds
  mining: 0.5,
} as const;

