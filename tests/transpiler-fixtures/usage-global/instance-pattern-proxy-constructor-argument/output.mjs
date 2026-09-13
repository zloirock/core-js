import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.function.name";
import "core-js/modules/es.global-this";
// An inline callee takes an instance slot off a constructor spelled through the realm.
// The argument's spelling and the other parameter's name do not change the slot's helper.
export const value = function ({
  name
}, Symbol) {
  return name;
}(globalThis.Symbol);