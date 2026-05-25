// `[Symbol.iterator]: {next}` - value is a nested ObjectPattern, NOT a binding Identifier.
// `prop binding-identifier resolver` in `symbolIteratorLocalName` returns null, so the synth-extraction
// path doesn't fire. but `planOuterProp` has a SECOND branch using `isSymbolIteratorComputedKey`
// alone: when the key shape matches but value isn't binding-extractable, emit the rebuilt
// preservedSrc with the polyfilled `[_Symbol$iterator]` key + verbatim value source. this
// closes the old polyfill miss where `Symbol.iterator` survived natively in the residual
// destructure (blanket walkAstNodes-skip suppressed the standalone Symbol-Identifier visitor).
// `preservedInitSrc` keeps user binding `obj` for aliased proxy-global (alias decl's own
// `= globalThis` init is polyfilled by the natural visitor independently)
const obj = globalThis;
const { Array: { from }, [Symbol.iterator]: { next } } = obj;
console.log(from, next);
