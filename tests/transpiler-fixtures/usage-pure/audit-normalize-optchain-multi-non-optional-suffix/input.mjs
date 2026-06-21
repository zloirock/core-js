// multiple non-optional `.X(...).Y(...)` continuations after the polyfilled inner. for
// `arr?.at(-1).valueOf().toString()` the polyfill replaces inner `arr?.at`, then the wrap
// must lift past `.valueOf()` and `.toString()` (OptionalMember/OptionalCall with
// `.optional=false` once the chain root is optional). distinct outer methods per line.
const a = arr?.at(-1).valueOf();
const b = arr?.flat().toString();
const c = arr?.includes('x').valueOf().toString();
export { a, b, c };
