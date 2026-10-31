import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Map from "@core-js/pure/actual/map";
import _Object$getOwnPropertyNames from "@core-js/pure/actual/object/get-own-property-names";
// A container declared in one LEXICAL scope and a same-named container written in a sibling scope are two bindings, and the census
// keys its records by the declaring scope: the write taints its own binding only, so the other's slot still binds the static - for
// a loop head (for-of, for-in, a for-init declarator), a block, a switch case and a catch parameter shadowing the name alike.
const out = [];
{
  var shared = {
    w: Object
  };
  const viaVarWrittenElsewhere = _Object$getOwnPropertyNames;
  _pushMaybeArray(out).call(out, viaVarWrittenElsewhere);
}
{
  var shared = {
    w: Array
  };
  shared.w = _Map;
}
export { out };