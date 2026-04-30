// Declaration files (.d.cts / .d.mts / .d.ts) are gated out by the bundler at the
// transformInclude hook. When the plugin is called directly with such an id (test runner
// bypasses the gate), the file is type-only: ambient bindings emit no runtime polyfill,
// and `typeof arr.at` is a type position so the call doesn't trigger detection either.
declare const arr: number[];
export type X = ReturnType<typeof arr.at>;