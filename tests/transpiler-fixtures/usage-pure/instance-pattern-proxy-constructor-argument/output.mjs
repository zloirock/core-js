import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
// An inline callee takes an instance slot off a constructor spelled through the realm.
// The argument's spelling and the other parameter's name do not change the slot's helper.
export const value = function ({
  name
}, Symbol) {
  return name;
}({
  name: _nameMaybeFunction(_Symbol)
});