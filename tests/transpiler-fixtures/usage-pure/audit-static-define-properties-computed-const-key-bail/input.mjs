// Object.defineProperties with a const-aliased COMPUTED key (`{ [k]: ... }`) names the same slot
// as a shorthand key; the descriptor value overrides the built-in, so the later call keeps the
// user patch instead of substituting the pure polyfill
const key = "fromEntries";
Object.defineProperties(Object, { [key]: { value: function () { return []; } } });
Object.fromEntries([["a", 1]]);
