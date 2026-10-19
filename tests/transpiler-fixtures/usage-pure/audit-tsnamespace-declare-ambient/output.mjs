import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// `declare namespace Promise { ... }` is ambient - elided by `tsc`. `Promise.resolve(1)`
// at runtime resolves to the global. polyfill must fire for legacy targets, declaration
// LHS preserved
declare namespace Promise {
  const X: number;
}
// @ts-expect-error the ambient declaration types the read for tsc alone, and the runtime reads the global
const p = _Promise$resolve(1);
export { p };