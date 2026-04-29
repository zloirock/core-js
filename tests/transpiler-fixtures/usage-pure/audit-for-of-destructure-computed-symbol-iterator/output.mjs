import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// for-of loop binding pattern uses computed Symbol.iterator key. The polyfill binding
// is substituted for the key, but no extractor rewrite is triggered for the iterator
// extraction (each loop iteration's destructured value is a fresh user object, not
// a known polyfillable receiver). The optional call on the resolved binding stays as-is
for (const {
  [_Symbol$iterator]: it
} of [obj1, obj2]) {
  it?.();
}