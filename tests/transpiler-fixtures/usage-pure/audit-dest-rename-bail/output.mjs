import _Array$from from "@core-js/pure/actual/array/from";
// rename destructure: `bar` binds to `Array.foo` (undefined), not to `Array` - plugin
// preserves the original semantics so `bar.from(...)` stays a runtime error rather than
// being aliased to the receiver and accidentally working through a polyfill
const {
  foo: bar
} = Array;
(bar === Array ? _Array$from : bar.from.bind(bar))([1, 2, 3]);