import _findMaybeArray from "@core-js/pure/actual/array/instance/find";
// only a `symbol/` leaf naming a real `Symbol.<key>` static holds that static as its value.
// `symbol/constructor` binds the constructor itself and `symbol/description` is a side-effect
// only module, so a binding to either must not fold into a well-known-symbol key
import S from "@core-js/pure/actual/symbol/constructor";
import d from "@core-js/pure/actual/symbol/description";
const alias = S;
const hasAlias = alias in target;
const hasCtor = S in target;
const desc = target[d];
_findMaybeArray(target).call(target, x => x);