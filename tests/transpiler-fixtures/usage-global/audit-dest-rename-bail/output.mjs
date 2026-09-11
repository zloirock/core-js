// rename destructure: `bar` binds to `Array.foo` (undefined), not to `Array` - plugin
// preserves the alias semantics so the bundle stays free of an unused `es.array.from`
// module that aliasing to the receiver would pull in
const {
  foo: bar
} = Array;
bar.from([1, 2, 3]);