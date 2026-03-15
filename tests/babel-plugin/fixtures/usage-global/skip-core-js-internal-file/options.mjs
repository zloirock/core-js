export default {
  filename: '/node_modules/core-js/modules/es.array.at.js',
  plugins: [
    ['@core-js', {
      method: 'usage-global',
      version: '4.0',
      targets: { ie: 11 },
    }],
  ],
};
