// Reflect.defineProperty has the same monkey-patch semantics as Object.defineProperty,
// only the return shape differs (boolean instead of throwing). the mutation pre-pass
// must mark Array.from so the subsequent call is preserved verbatim. an unrelated
// static (Array.of) on the same constructor is NOT mutated and must still be polyfilled.
Reflect.defineProperty(Array, "from", { value: function () { return []; } });
Array.from([1, 2, 3]);
Array.of(4, 5);
