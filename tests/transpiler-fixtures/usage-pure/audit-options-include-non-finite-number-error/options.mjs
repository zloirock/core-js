// non-finite Number values - validatePatternList safeStringify -> JSON.stringify renders them as `null`
export default {
  plugins: [
    ['@core-js', {
      method: 'usage-pure',
      version: '4.0',
      include: [Infinity],
    }],
  ],
};
