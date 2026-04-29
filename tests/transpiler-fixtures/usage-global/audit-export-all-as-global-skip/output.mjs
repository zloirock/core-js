// `export * as Promise from "mod"` - the local `Promise` is a re-export alias, not a runtime
// reference to the global. Different parsers represent the alias position with different
// node shapes. The detection must recognise the alias position regardless and skip polyfill
// injection, otherwise Promise polyfill imports leak into files that only re-export the name
export * as Promise from "mod";