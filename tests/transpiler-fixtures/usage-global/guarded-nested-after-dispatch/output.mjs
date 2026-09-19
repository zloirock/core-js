import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.push";
import "core-js/modules/es.global-this";
import "core-js/modules/es.weak-set.constructor";
import "core-js/modules/web.dom-collections.iterator";
// The first nested dispatch and the later guarded slot share the original host.
// Neither may erase the source facts the other read still needs.
// A constructor escaping through the getter includes its static methods.
const log = [];
const {
  array: {
    at: first
  },
  realm: {
    WeakSet: Value
  },
  tail
} = {
  array: [41],
  get realm() {
    log.push(typeof first);
    return globalThis;
  },
  get tail() {
    log.push(typeof Value);
    return 3;
  }
};
export { first, Value, tail, log };