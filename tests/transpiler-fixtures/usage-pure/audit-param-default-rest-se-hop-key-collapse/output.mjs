import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
import _Set from "@core-js/pure/actual/set";
// Quiet constructor defaults retain static extraction and rest handling.
// Effectful realm-key receivers keep native defaults, fallback selection and key evaluation.
let eff = 0;
function f({
  from,
  ...rest
} = _globalThis[eff++, 'self'].Array) {
  return [from, rest];
}
f();
function g({
  of,
  ...rest
} = _globalThis[eff++, 'self'].Array || _Set) {
  return [of, rest];
}
g();
function m({
  from,
  of,
  ...rest
} = _globalThis[eff++, 'self'].Array) {
  return [from, of, rest];
}
m();
function n({
  isArray,
  from: _unused,
  ...rest
} = _self.Array) {
  let f2 = _Array$from;
  return [isArray, f2, rest];
}
n();
function p({
  groupBy,
  ...rest
} = _globalThis[eff++, 'self'].Map) {
  return [groupBy, rest];
}
p();
function h({
  isArray,
  ...rest
} = _self.Array) {
  return [isArray, rest];
}
h();
function k({
  isInteger,
  ...rest
} = _globalThis[eff++, 'self'].Number || _Set) {
  return [isInteger, rest];
}
k();