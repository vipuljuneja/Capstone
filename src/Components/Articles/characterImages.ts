import { ImageSourcePropType } from 'react-native';

// Central map for Pipo character artwork. Expand keys as new characters are introduced.
const CHARACTER_IMAGES: Record<string, ImageSourcePropType> = {
  blob: require('../../../assets/pipo/articlePipo.png'),
  confident: require('../../../assets/pipo/344558bb23e53e1ac26836f1d40539906baf4962.png'),
  mindful: require('../../../assets/pipo/7e242616b3d529a8f8dd05da34e0e0b8dd136422.png'),
  explorer: require('../../../assets/pipo/a50e3f3cf74aa3607672d4181da5d4ca94f6660d.png'),
  calm: require('../../../assets/pipo/a6e573326935738b0ffb13ccd61f4c8a36f7128c.png'),
  focused: require('../../../assets/pipo/b5e3eb6900aac55a95604b1d8fd9eb36dab05d2f.png'),
  spirited: require('../../../assets/pipo/c474f4c1ad7574dc34e05ec7e6f2fc9a55c5db0c.png')
};

const FALLBACK = CHARACTER_IMAGES.blob;

export const characterImageFor = (character?: string): ImageSourcePropType => {
  if (!character) return FALLBACK;
  return CHARACTER_IMAGES[character] ?? FALLBACK;
};

export default CHARACTER_IMAGES;
