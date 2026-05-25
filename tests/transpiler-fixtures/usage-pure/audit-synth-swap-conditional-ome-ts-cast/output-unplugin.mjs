import _Array$from from "@core-js/pure/actual/array/from";
// TS-cast around an OptionalMemberExpression branch: `cond ? Array : (globalThis?.Array as any)`.
// the runtime-transparent peel strips both the TS wrapper AND the inner ChainExpression so
// per-branch synth-swap sees the bare OME shape on both adapters. without ChainExpression in
// the wrapper set, oxc's `ChainExpression(OME)` falls through the type check and goes raw
declare const cond: boolean;
function f({ from } = cond ? { from: _Array$from } : ({ from: _Array$from } as any)) {
  return from([1, 2, 3]);
}
f();