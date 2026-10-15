import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.values";
import "core-js/modules/es.global-this";
// A reassigned realm alias retains its prefix and dispatches on the actual prototype.
// Every written alternative yields an array receiver or throws before the method read.
let effects = 0;
let realm = globalThis;
const rebind = () => {
  realm = {};
};
const {
  Array: {
    prototype: {
      at,
      values
    }
  }
} = (effects++, realm);