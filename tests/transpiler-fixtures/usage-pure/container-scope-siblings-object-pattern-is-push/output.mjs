import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Object$is from "@core-js/pure/actual/object/is";
// A container declared in one LEXICAL scope and a same-named container written in a sibling scope are two bindings, and the census
// keys its records by the declaring scope: the write taints its own binding only, so the other's slot still binds the static - for
// a loop head (for-of, for-in, a for-init declarator), a block, a switch case and a catch parameter shadowing the name alike.
const out = [];
for (let i = 0, item = {
    w: Object
  }; i < 1; i++) {
  const viaForInit = _Object$is;
  _pushMaybeArray(out).call(out, viaForInit);
}
export { out };