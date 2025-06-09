import createCache from '@emotion/cache';
const isBrowser = typeof document !== 'undefined';
export default function createEmotionCache() {
  return createCache({
    key: 'mui',
    insertionPoint: isBrowser
      ? document.querySelector('meta[name="emotion-insertion-point"]')
      : null,
  });
}