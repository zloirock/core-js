import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.push";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.weak-map.constructor";
import "core-js/modules/es.weak-map.get-or-insert";
import "core-js/modules/es.weak-map.get-or-insert-computed";
import "core-js/modules/es.weak-set.constructor";
import "core-js/modules/web.dom-collections.iterator";
// A kept getter runs before its destructured binding initializes. Its returned realm still
// supplies a polyfilled constructor, through a direct literal, an alias and an assignment.
// The assignment getter observes the old binding, then the assignment installs the ponyfill.
// A constructor escaping through the getter includes its static methods.
export function direct(log) {
  const {
    w: {
      WeakSet: Value
    }
  } = {
    get w() {
      log.push('direct');
      return globalThis;
    }
  };
  return Value;
}
export function aliased(log) {
  const source = {
    get w() {
      log.push('alias');
      return globalThis;
    }
  };
  const {
    w: {
      WeakMap: Value
    }
  } = source;
  return Value;
}
export function assigned(log) {
  let Value = 'before';
  ({
    w: {
      Map: Value
    }
  } = {
    get w() {
      log.push(Value);
      return globalThis;
    }
  });
  return Value;
}