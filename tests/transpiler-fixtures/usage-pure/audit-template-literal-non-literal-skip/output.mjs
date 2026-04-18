import _Symbol from "@core-js/pure/actual/symbol/constructor";
// interpolation references a runtime binding, not a literal - resolveKey returns null,
// so no `is-iterable` polyfill; only the bare `Symbol` identifier triggers its polyfill
const k = getName();
_Symbol[`${k}`] in obj;