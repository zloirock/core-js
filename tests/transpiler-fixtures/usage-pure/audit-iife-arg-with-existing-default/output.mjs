import _Set from "@core-js/pure/actual/set/constructor";
// IIFE arg overrides param-default `Array`; user destructure has explicit fallback `[]`.
// Caller-arg semantic wins at runtime, so the user's `[]` default is preserved verbatim
// to keep observable behaviour unchanged. Receiver `Set` (constructor missing on legacy
// targets) still gets its polyfill
const x = (({
  from = []
} = Array) => from)(_Set);
export { x };