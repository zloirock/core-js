// `normalizeOptionalChain` walking past multiple non-optional `.X(...).Y(...)` after the
// polyfilled inner. for `arr?.at(-1).valueOf().toString()` the polyfill replaces inner
// `arr?.at`, then `normalizeOptionalChain` must lift the wrap past chain continuations
// `.valueOf()` and `.toString()` (which are OptionalMember/OptionalCall with `.optional=false`
// when the chain root itself is optional). distinct outer methods per line for visibility
const a = arr?.at(-1).valueOf();
const b = arr?.flat().toString();
const c = arr?.includes('x').valueOf().toString();
export { a, b, c };
