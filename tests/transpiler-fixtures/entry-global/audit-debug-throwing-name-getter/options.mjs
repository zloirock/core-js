// adversarial function passed as `debug` option: reading `.name` throws. the validator must
// still produce its original type-mismatch error, not a secondary getter crash that would
// mask the root cause
const fn = function bad() {};
Object.defineProperty(fn, 'name', { get() { throw new TypeError('adversarial name getter'); } });
export default {
  plugins: [
    ['@core-js', {
      method: 'entry-global',
      version: '4.0',
      debug: fn,
    }],
  ],
};
