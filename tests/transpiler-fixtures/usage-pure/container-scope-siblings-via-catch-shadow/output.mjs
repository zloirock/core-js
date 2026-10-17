import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// A container declared in one LEXICAL scope and a same-named container written in a sibling scope are two bindings, and the census
// keys its records by the declaring scope: the write taints its own binding only, so the other's slot still binds the static - for
// a loop head (for-of, for-in, a for-init declarator), a block, a switch case and a catch parameter shadowing the name alike.
const out = [];
const holder = {
  w: Object
};
const viaCatchShadow = _Object$fromEntries;
_pushMaybeArray(out).call(out, viaCatchShadow);
export { out };