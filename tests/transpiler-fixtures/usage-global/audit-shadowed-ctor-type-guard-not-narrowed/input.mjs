// `at` / `includes` are the ONLY multi-type instance methods (Array + String + TypedArray), so a wrong
// array-narrow is OBSERVABLE - it drops their String/TypedArray resolution to the array-specific binding.
// `const Array = Map` shadows the ctor: `x instanceof Array` really tests `instanceof Map` and `Array.isArray`
// reads `Map.isArray`, so the guard must NOT narrow x to the array type. shadow-aware -> x stays unknown and
// the method keeps its GENERIC multi-type binding (a shadow-BLIND narrow would emit the array-specific one,
// a wrong-type dispatch on pure / a missed String polyfill on global)
const Array = Map;

// instanceof channel: the POSITIVE branch would normally narrow x to the array type
export function viaInstanceof(x) {
  if (x instanceof Array) return x.at(0);
  return null;
}

// isArray channel, NEGATED branch: a real array flows here (an array is not a Map), so its generic
// binding must survive - narrowing it away from the array type drops the polyfill the real array needs
export function viaIsArray(x) {
  if (!Array.isArray(x)) return x.includes(1);
  return null;
}
