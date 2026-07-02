import _Array$from from "@core-js/pure/actual/array/from";
// BOTH branches as OptionalMemberExpression: `cond ? globalThis?.Array : self?.Array`. each
// branch resolves to Array via proxy-global walks (`globalThis?` and `self?` both in
// POSSIBLE_GLOBAL_OBJECTS). synth-swap fires on BOTH branches, emitting `{from: _Array$from}`
// for each
declare const cond: boolean;
function f({
  from
} = cond ? {
  from: _Array$from
} : {
  from: _Array$from
}) {
  return from([1, 2, 3]);
}
f();