import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.values";
import "core-js/modules/es.global-this";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.dispose";
import "core-js/modules/es.iterator.drop";
import "core-js/modules/es.iterator.every";
import "core-js/modules/es.iterator.filter";
import "core-js/modules/es.iterator.find";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.iterator.for-each";
import "core-js/modules/es.iterator.from";
import "core-js/modules/es.iterator.map";
import "core-js/modules/es.iterator.reduce";
import "core-js/modules/es.iterator.some";
import "core-js/modules/es.iterator.take";
import "core-js/modules/es.iterator.to-array";
import "core-js/modules/es.string.iterator";
import "core-js/modules/esnext.iterator.chunks";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/esnext.iterator.join";
import "core-js/modules/esnext.iterator.windows";
import "core-js/modules/web.dom-collections.iterator";
// a chain assignment inside a ternary branch still marks the destructured leaf: the runtime
// may yield the assigned global on that path, so the static must be injected
let c1 = Math.random() < 0.5;
let q;
let x1 = {
  Iterator: {
    from: v => v
  }
};
const {
  Iterator: {
    from: iterFrom
  }
} = c1 ? q = globalThis : x1;
export const viaChainAssign = iterFrom([1].values());

// a chain assignment wrapping a logical fallback injects through the right operand too
let c2 = Math.random() < 0.5;
let w,
  m = null;
let x2 = {
  Array: {
    from: v => v
  }
};
const {
  Array: {
    from: arrayFrom
  }
} = c2 ? w = m || globalThis : x2;
export const viaChainLogical = arrayFrom([1, 2]);