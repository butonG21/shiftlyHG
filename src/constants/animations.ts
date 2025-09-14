// Animation constants
export const SHIFT_ANIMATIONS = {
  pagi: require('../../assets/animations/pagi2.json'),
  middle: require('../../assets/animations/siang-midle.json'),
  siang: require('../../assets/animations/siang-midle.json'),
  off: require('../../assets/animations/off.json'),
} as const;

export const ANIMATION_CONFIG = {
  duration: {
    short: 200,
    medium: 300,
    long: 500,
  },
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
} as const;