import _Object$assign from "@core-js/pure/actual/object/assign";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$values from "@core-js/pure/actual/object/values";
import _Promise from "@core-js/pure/actual/promise";
// Constructor defaults with rest use the full index; supplied objects keep their properties.
// Other static extractions require closed callers; key/default effects remain independent.
function div({
  values: _unused,
  ...rest
} = Object) {
  let values = _Object$values;
  return [values, rest];
}
function Attr({
  assign: _unused2,
  ...rest
} = Object) {
  let assign = _Object$assign;
  return [assign, rest];
}
function Tail({
  entries: _unused3,
  ...rest
} = Object) {
  let entries = _Object$entries;
  return [entries, rest];
}
function Ns({
  all,
  ...rest
} = _Promise) {
  return [all, rest];
}
function NsAttr({
  race,
  ...rest
} = _Promise) {
  return [race, rest];
}
function Referenced({
  from,
  ...rest
} = Array) {
  return [from, rest];
}
export const elements = [<div x={1} />, <Other Attr={1} />, <Other.Tail x={1} />, <Ns:x y={1} />, <Other z:NsAttr={1} />, <Referenced x={1} />];