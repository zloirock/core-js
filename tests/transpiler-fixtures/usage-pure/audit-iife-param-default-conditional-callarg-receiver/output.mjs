import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// an IIFE destructure param carrying a DEFAULT, invoked with a non-simple receiver (a conditional or
// logical call-arg): the live call-arg is the receiver, NOT the dead default. each branch is enumerated
// per-branch, so a polyfillable static on a branch (`Array.from` / `Array.of` / `Object.fromEntries`) is
// synthesized rather than suppressed by the default. all three receiver operators are covered - ternary,
// `||` (left-collapse), `&&` (right-select) - with distinct methods tracing each line.
const cond = true;
export const a = (({
  from
} = Object) => from([1]))(cond ? {
  from: _Array$from
} : _Map);
export const b = (({
  of
} = Object) => of(1, 2))(_globalThis.Poly || {
  of: _Array$of
});
export const c = (({
  fromEntries
} = Array) => fromEntries([]))(cond && {
  fromEntries: _Object$fromEntries
});