// rename destructure: `bar` binds to `Array.foo` (undefined), not to `Array` - plugin must
// not alias it to the receiver or broken code would silently gain a working polyfill
const { foo: bar } = Array;
bar.from([1, 2, 3]);
