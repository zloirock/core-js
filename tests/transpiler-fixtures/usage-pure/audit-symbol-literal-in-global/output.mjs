// `'Symbol.iterator' in Array` - left operand is a string literal that happens to
// spell the well-known symbol's description, NOT a reference to `Symbol.iterator`.
// semantically the expression always evaluates to `false`, and plugin leaves it
// untouched - rewriting to an iterability check would change the observable semantics
'Symbol.iterator' in Array;