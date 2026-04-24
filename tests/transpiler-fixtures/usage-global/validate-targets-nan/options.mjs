// diagnostic rendering of `targets: NaN` must surface the actual value (via String/toString),
// not render as `null` through JSON.stringify
export default {
  plugins: [
    ['@core-js', {
      method: 'usage-global',
      version: '4.0',
      targets: NaN,
    }],
  ],
};
