// for-of loop binding pattern uses computed Symbol.iterator key. plugin substitutes
// the polyfill binding for the key but does NOT trigger synth-swap of the iterator
// extraction (each loop iteration's destructured value is a fresh user object, not
// a known polyfillable receiver). optional call on the resolved binding stays as-is
for (const { [Symbol.iterator]: it } of [obj1, obj2]) {
  it?.();
}
