import _Promise from "@core-js/pure/actual/promise/constructor";
// Rest-bearing parameters keep their native bindings and defaults in parameter scope.
// Independent reads and key/default expressions still receive their own polyfills.
var cond = true;
export const viaTagName = function F({
  from,
  ...rest
} = Array) {
  return cond ? (cond = false, <F x={1} />) : [from, rest];
}();
export const viaMemberRoot = function G({
  of,
  ...rest
} = Array) {
  return cond ? (cond = false, <G.Sub x={1} />) : [of, rest];
}();
export const attributeNameNotRef = function H({
  assign,
  ...rest
} = Object) {
  return <div H={1}>{assign({}, rest, {
      a: 1
    }).a}</div>;
}();
export const memberTailNotRef = function K({
  entries,
  ...rest
} = Object) {
  return <Other.K x={1}>{entries(rest).length}</Other.K>;
}();
export const namespacedNotRef = function L({
  keys,
  ...rest
} = Object) {
  return <ns:L x={1}>{keys(rest).length}</ns:L>;
}();
export const intrinsicTagNotRef = function div({
  values,
  ...rest
} = Object) {
  return <div>{values(rest).length}</div>;
}();
export const memberRootIntrinsicSpelling = function d({
  fromEntries,
  ...rest
} = Object) {
  return cond ? (cond = false, <d.Sub x={1} />) : [fromEntries([['a', 1]]), rest];
}();
export const selfRefInParamDefault = function P({
  all,
  ...rest
} = _Promise, cb = () => <P x={1} />) {
  return [all, rest, cb];
}();
export const intrinsicInParamDefault = function span({
  race,
  ...rest
} = _Promise, cb = () => <span x={1} />) {
  return [race, rest, cb];
}();