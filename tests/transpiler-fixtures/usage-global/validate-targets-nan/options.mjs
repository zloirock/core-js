// NaN / Infinity / Symbol previously rendered as null / undefined via JSON.stringify —
// useless for diagnosing. `formatReceived` surfaces them via String / toString
export default {
  plugins: [
    ['@core-js', {
      method: 'usage-global',
      version: '4.0',
      targets: NaN,
    }],
  ],
};
