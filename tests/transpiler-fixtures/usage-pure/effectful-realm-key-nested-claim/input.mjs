// An effectful realm key retains the native computed read and sealed throw.
// Its independent array claim remains polyfilled before the optional test.
const effects = [];
export const value = (globalThis[(effects.push('key'), 'window')]?.self).Array.of(2);
export { effects };
