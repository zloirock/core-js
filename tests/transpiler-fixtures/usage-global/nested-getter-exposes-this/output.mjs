import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.weak-set.constructor";
import "core-js/modules/web.dom-collections.iterator";
// A getter exposing its object through this keeps its returned realm for later readers.
let leaked;
const {
  w: {
    WeakSet: value
  }
} = {
  get w() {
    leaked = this;
    return globalThis;
  }
};
inspect(leaked.w === globalThis);