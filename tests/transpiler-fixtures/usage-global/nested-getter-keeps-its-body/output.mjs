import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.weak-set.constructor";
import "core-js/modules/web.dom-collections.iterator";
// The nested pattern keeps its getter and effects; only the returned realm is mirrored.
const {
  w: {
    WeakSet: value
  }
} = {
  get w() {
    mark();
    return globalThis;
  }
};