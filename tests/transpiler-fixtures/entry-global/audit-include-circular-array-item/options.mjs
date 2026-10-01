// an invalid item whose JSON serialization throws (circular reference) is passed inside
// `include`. the validator must surface the original "string or RegExp" type mismatch,
// not a secondary stringify crash that would hide it
const circular = { name: 'cycle' };
circular.self = circular;
export default {
  plugins: [
    ['@core-js', {
      method: 'entry-global',
      version: '4.0',
      include: [circular],
    }],
  ],
};
