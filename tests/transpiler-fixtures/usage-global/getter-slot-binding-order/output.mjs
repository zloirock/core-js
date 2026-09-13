import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.push";
import "core-js/modules/es.global-this";
import "core-js/modules/es.weak-set.constructor";
import "core-js/modules/web.dom-collections.iterator";
// The getter executes while the destructured declaration is still uninitialized.
// Reading that binding must keep its temporal-dead-zone failure after rewriting.
// A constructor escaping through the getter includes its static methods.
export function readBeforeBinding(log) {
  const {
    w: {
      WeakSet: Value
    }
  } = {
    get w() {
      log.push(typeof Value);
      return globalThis;
    }
  };
  return Value;
}