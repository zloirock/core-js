import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.push";
import "core-js/modules/es.global-this";
import "core-js/modules/es.weak-set.constructor";
import "core-js/modules/web.dom-collections.iterator";
// Ordinary instance reads on both sides join the nested guarded slot's schedule.
// The first method binds before the receiver getter, and the last sees the constructor.
// A constructor escaping through the getter includes its static methods.
const log = [];
const {
  at: first,
  realm: {
    WeakSet: Value
  },
  includes: last
} = {
  get at() {
    log.push('first');
    return function () {
      return 41;
    };
  },
  get realm() {
    log.push(typeof first);
    return globalThis;
  },
  get includes() {
    log.push(typeof Value);
    return function () {
      return 42;
    };
  }
};
export { first, Value, last, log };