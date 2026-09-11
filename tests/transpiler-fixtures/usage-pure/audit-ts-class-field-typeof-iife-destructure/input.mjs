// TS class field annotated `typeof Array.from` with IIFE init that destructures the
// polyfillable static. annotation is purely type-level and doesn't trigger usage; the
// IIFE body's `const { from } = Array` resolves to the polyfill alias as in
// `destructuring-class-field-iife`. annotation passes through unchanged
class C {
  fromFn: typeof Array.from = (() => {
    const { from } = Array;
    return from;
  })();
}
