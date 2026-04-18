// interpolation references a runtime binding, not a literal - resolveKey returns null,
// so no `is-iterable` polyfill; only the bare `Symbol` identifier triggers its polyfill
const k = getName();
Symbol[`${k}`] in obj;
