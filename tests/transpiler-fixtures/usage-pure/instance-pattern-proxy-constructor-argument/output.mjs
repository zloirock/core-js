import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
// An inline callee takes an instance slot off a constructor spelled through the realm.
// The argument's spelling and the other parameter's name do not change the slot's helper.
export const value = function (_ref, Symbol, _unused = void 0) {
  let name = _nameMaybeFunction(_ref);
  return name;
}(_Symbol);