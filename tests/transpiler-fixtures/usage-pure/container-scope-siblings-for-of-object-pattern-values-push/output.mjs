import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Map from "@core-js/pure/actual/map";
import _Object$values from "@core-js/pure/actual/object/values";
// A container declared in one LEXICAL scope and a same-named container written in a sibling scope are two bindings, and the census
// keys its records by the declaring scope: the write taints its own binding only, so the other's slot still binds the static - for
// a loop head (for-of, for-in, a for-init declarator), a block, a switch case and a catch parameter shadowing the name alike.
const out = [];
for (const item of [{
  w: Object
}]) {
  const viaForOfHead = _Object$values;
  _pushMaybeArray(out).call(out, viaForOfHead);
}
for (const item of [{
  w: Array
}]) item.w = _Map;
export { out };