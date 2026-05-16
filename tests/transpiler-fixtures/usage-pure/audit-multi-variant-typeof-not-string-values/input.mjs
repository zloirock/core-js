// `typeof x !== 'string'` is a typeof-negative narrow (excludedHints path in resolveHint).
// asserts the desc.common preference applies to BOTH the positive (includedHints) AND the
// negative (excludedHints) narrow paths when 2+ type-specific variants match. negative
// path leaves array + domcollection + others all unexcluded - same multi-match shape.
function f(x) {
  if (typeof x !== "string") x.values();
}
