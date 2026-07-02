// rename destructure: `bar` binds to `Array.foo` (undefined), not to `Array` - plugin
// preserves the original semantics so `bar.from(...)` stays a runtime error rather than
// being aliased to the receiver and accidentally working through a polyfill
const { foo: bar } = Array;
bar.from([1, 2, 3]);
