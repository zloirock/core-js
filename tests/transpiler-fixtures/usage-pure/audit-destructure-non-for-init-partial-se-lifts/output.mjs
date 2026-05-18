import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// non-for-init partial-consume + SE prefix: VariableDeclaration at statement scope (NOT
// inside for-init). SE prefix lifts to a standalone statement BEFORE the preserved
// declarator via `liftExtractedSEPrefixes` - the for-init sink-declarator path doesn't
// fire here. ensures `injectForInitSESinks` is properly gated on isForInit and doesn't
// double-emit SE when the lift path already handles it
declare const logCall: () => any;
logCall();
const from = _Array$from;
const {
  Array: _unused,
  ...rest
} = _globalThis;
console.log(from, rest);