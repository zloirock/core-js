// `ReturnType<typeof impl>` where `impl` is a declare-const with a function-type annotation
// but no initializer: type-query resolution bails on the init-less variable, and the
// fallback path reads the function-type annotation's return type directly. Without this
// fallback the type collapses to null and `.at(0)` lands on the generic common polyfill
declare const impl: (x: unknown) => number[];
type Result = ReturnType<typeof impl>;
declare const r: Result;
r.at(-1);
