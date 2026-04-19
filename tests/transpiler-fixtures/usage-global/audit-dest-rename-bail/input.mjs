// rename destructure: `bar` binds to `Array.foo` (undefined), not to `Array` - plugin must
// not alias it to the receiver or bundle would gain unused `es.array.from` module
const { foo: bar } = Array;
bar.from([1, 2, 3]);
