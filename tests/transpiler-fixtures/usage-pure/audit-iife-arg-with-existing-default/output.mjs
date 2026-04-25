import _Set from "@core-js/pure/actual/set/constructor";
// IIFE arg overrides param-default `Array`; user destructure has explicit fallback `[]`.
// Plugin must not crash. Caller-arg semantic wins at runtime - polyfilling the user's
// `[]` would silently change observable behaviour, so we leave the existing default
// intact. Receiver `Set` (constructor missing on legacy targets) still gets its polyfill
const x = (({
  from = []
} = Array) => from)(_Set);
export { x };