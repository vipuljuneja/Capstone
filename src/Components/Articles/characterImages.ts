import { ImageSourcePropType } from 'react-native';

const blobDefault = require('../../../assets/pipo/articlePipo.png');
const blobGreen = require('../../../assets/pipo/7e242616b3d529a8f8dd05da34e0e0b8dd136422.png');
const blobPurple = require('../../../assets/pipo/344558bb23e53e1ac26836f1d40539906baf4962.png');
const blobYellow = require('../../../assets/pipo/b5e3eb6900aac55a95604b1d8fd9eb36dab05d2f.png');

// Central map for Pipo character artwork. Expand keys as new characters are introduced.
const CHARACTER_IMAGES: Record<string, ImageSourcePropType> = {
  blob: blobDefault,
  confident: blobPurple,
  mindful: blobGreen,
  explorer: blobYellow,
  calm: blobPurple,
  focused: blobYellow,
  spirited: blobGreen
};

const FALLBACK = CHARACTER_IMAGES.blob;

export const characterImageFor = (character?: string): ImageSourcePropType => {
  if (!character) return FALLBACK;
  return CHARACTER_IMAGES[character] ?? FALLBACK;
};

export default CHARACTER_IMAGES;
