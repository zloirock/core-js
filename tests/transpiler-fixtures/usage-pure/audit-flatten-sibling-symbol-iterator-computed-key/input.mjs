// flatten on inner `from` + sibling `[Symbol.iterator]: iter` computed key. `planOuterProp`
// recognizes the Symbol.iterator-keyed Property shape (binding-Identifier value) and emits
// a synth extraction `iter = _getIteratorMethod(receiver)` alongside the regular extraction
// `from = _Array$from`. preservedOuter ends up empty for both extractions so the whole
// VariableDeclaration is replaced by two `const ...;` statements. matches babel-plugin's
// AST-mutation emit byte-for-byte (receiver `obj` survives in `_getIteratorMethod(obj)`
// because `extractionReceiverSrc` always uses `nodeSrc(tail)`; natural visitor's
// `globalThis -> _globalThis` substitution composes into the rebuilt text via
// transform-queue's nested-overwrite handling)
const obj = globalThis;
const { Array: { from }, [Symbol.iterator]: iter } = obj;
console.log(from, iter);
