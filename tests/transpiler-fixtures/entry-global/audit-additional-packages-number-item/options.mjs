// non-string non-undefined invalid item - always caught (no sentinel issue)
export default {
  plugins: [
    ['@core-js', {
      method: 'entry-global',
      version: '4.0',
      additionalPackages: ['ok', 42],
    }],
  ],
};
