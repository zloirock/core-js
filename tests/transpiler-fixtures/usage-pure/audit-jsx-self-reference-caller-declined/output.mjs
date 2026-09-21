import _Object$assign from "@core-js/pure/actual/object/assign";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Object$values from "@core-js/pure/actual/object/values";
import _Promise from "@core-js/pure/actual/promise";
// Constructor defaults with rest use the full index; supplied objects keep their properties.
// Other static extractions require closed callers; key/default effects remain independent.
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
  assign: _unused,
  ...rest
} = Object) {
  let assign = _Object$assign;
  return <div H={1}>{assign({}, rest, {
      a: 1
    }).a}</div>;
}();
export const memberTailNotRef = function K({
  entries: _unused2,
  ...rest
} = Object) {
  let entries = _Object$entries;
  return <Other.K x={1}>{entries(rest).length}</Other.K>;
}();
export const namespacedNotRef = function L({
  keys: _unused3,
  ...rest
} = Object) {
  let keys = _Object$keys;
  return <ns:L x={1}>{keys(rest).length}</ns:L>;
}();
export const intrinsicTagNotRef = function div({
  values: _unused4,
  ...rest
} = Object) {
  let values = _Object$values;
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