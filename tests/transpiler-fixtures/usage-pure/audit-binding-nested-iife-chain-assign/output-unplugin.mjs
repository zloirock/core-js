import _Array$from from "@core-js/pure/actual/array/from";
// nested IIFE whose innermost returned expression is a chain-assignment: the receiver still inlines
// to Array through both call hops, and the WHOLE nested IIFE is preserved as a side effect so the
// `a = Array` write is not dropped - emits `((() => (() => a = Array)())(), _Array$from)([])`.
let a;
export const r = ((() => (() => (a = Array))())(), _Array$from)([]);