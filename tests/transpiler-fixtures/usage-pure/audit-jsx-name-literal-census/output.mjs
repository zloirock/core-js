import _Object$assign from "@core-js/pure/actual/object/assign";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$values from "@core-js/pure/actual/object/values";
import _Promise$all from "@core-js/pure/actual/promise/all";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$race from "@core-js/pure/actual/promise/race";
// The negative half of the same rule: a JSX name that lowers to a STRING names no binding, so it is
// no caller and the caller-lossy extract stays sound. Four slots spell such a name - a lowercase-
// initial bare tag, an attribute name, a member tag's tail, and either half of a namespaced name -
// and each row here is reachable through that slot alone.
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
  all: _unused4,
  ...rest
} = _Promise) {
  let all = _Promise$all;
  return [all, rest];
}
function NsAttr({
  race: _unused5,
  ...rest
} = _Promise) {
  let race = _Promise$race;
  return [race, rest];
}

// CONTROL: a bare tag naming this one, so the file also exercises the verbatim verdict it pins.
function Referenced({
  from,
  ...rest
} = Array) {
  return [from, rest];
}
export const elements = [<div x={1} />, <Other Attr={1} />, <Other.Tail x={1} />, <Ns:x y={1} />, <Other z:NsAttr={1} />, <Referenced x={1} />];