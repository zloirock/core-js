// a static monkey-patched through a const-aliased computed key (`const k = "from"; Array[k] = ...`)
// lands on the same slot as `Array.from = ...`; the read side follows the same const binding, so
// the later call keeps the user patch instead of substituting the pure polyfill
const fromKey = "from";
Array[fromKey] = function () { return []; };
const ofKey = "of";
Object.defineProperty(Array, ofKey, { value: function () { return []; } });
Array.from([1, 2, 3]);
Array.of(4, 5);
