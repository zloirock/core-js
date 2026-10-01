// RegExp `include` is treated as a module-name pattern. If it matches nothing, the
// plugin surfaces an error.
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
