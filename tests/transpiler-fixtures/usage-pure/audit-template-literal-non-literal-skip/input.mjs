// template interpolation `${k}` references a runtime binding (not a static
// literal), so `Symbol[...]` cannot be recognised as `Symbol.iterator` and no
// is-iterable polyfill is injected - only the bare `Symbol` reference is polyfilled
const k = getName();
Symbol[`${k}`] in obj;
