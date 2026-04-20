// undefined in a middle slot, flanked by valid strings - findIndex returns the
// real index, not a sentinel-collision
export default {
  plugins: [
    ['@core-js', {
      method: 'entry-global',
      version: '4.0',
      additionalPackages: ['ok', undefined, 'also-ok'],
    }],
  ],
};
