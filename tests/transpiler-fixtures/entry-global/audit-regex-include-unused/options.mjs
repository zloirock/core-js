// RegExp include that doesn't match any polyfill - `isModulePattern(RegExp)` is true so
// this is treated as module pattern; when no polyfill matches, an error is surfaced
export default {
  plugins: [
    ['@core-js', {
      method: 'entry-global',
      version: '4.0',
      targets: { ie: 11 },
      include: [/^not\.a\.real\.polyfill$/],
    }],
  ],
};
