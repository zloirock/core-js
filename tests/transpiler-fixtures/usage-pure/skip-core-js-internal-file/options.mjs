export default {
  filename: '/node_modules/@core-js/pure/internals/some-helper.js',
  plugins: [
    ['@core-js', {
      method: 'usage-pure',
      version: '4.0',
      targets: { ie: 11 },
    }],
  ],
};
