import { ImageSourcePropType } from 'react-native';

const blobDefault = require('../../../assets/Illustration/Small_Steps.png');
const blobGreen = require('../../../assets/pipo/pipo-hi.png');
const blobPurple = require('../../../assets/pipo/pipo-coffee.png');
const blobYellow = require('../../../assets/pipo/pipo-job.png');

// Central map for Pipo character artwork. Expand keys as new characters are introduced.
const CHARACTER_IMAGES: Record<string, ImageSourcePropType> = {
  blob: blobDefault,
  confident: blobPurple,
  mindful: blobGreen,
  explorer: blobYellow,
  calm: blobPurple,
  focused: blobYellow,
  spirited: blobGreen,
};

const FALLBACK = CHARACTER_IMAGES.blob;

export const characterImageFor = (character?: string): ImageSourcePropType => {
  if (!character) return FALLBACK;
  return CHARACTER_IMAGES[character] ?? FALLBACK;
};

export default CHARACTER_IMAGES;
