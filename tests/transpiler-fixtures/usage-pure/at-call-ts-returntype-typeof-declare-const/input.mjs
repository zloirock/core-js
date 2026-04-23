// `ReturnType<typeof impl>` where `impl` is a declare-const with a function-type annotation
// but no initializer: resolveTypeQueryBinding bails on the init-less VariableDeclarator,
// fallback path reads the function-type annotation's return type directly. without this
// fallback the type collapses to null and `.at(0)` lands on the generic common polyfill
declare const impl: (x: unknown) => number[];
type Result = ReturnType<typeof impl>;
declare const r: Result;
r.at(-1);
