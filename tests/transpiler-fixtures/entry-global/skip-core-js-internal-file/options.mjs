export default {
  filename: '/node_modules/core-js-bundle/index.js',
  plugins: [
    ['@core-js', {
      method: 'entry-global',
      version: '4.0',
      targets: { ie: 11 },
    }],
  ],
};
