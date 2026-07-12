import "core-js/modules/es.object.group-by";
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
// a `||` / `??` RIGHT-operand global proxy buried in a ternary branch still marks the
// destructured leaf: the runtime may yield the global on that path, so the static must
// be injected (the left operand stays primary; a proxy left is followed as before)
let c = Math.random() < 0.5;
let m = null;
let x = {
  Array: {
    from: v => v
  }
};
const {
  Array: {
    from
  }
} = c ? m || globalThis : x;
export const viaOrRight = from([1, 2]);

// `??` right fallback in the ternary ALTERNATE marks the leaf the same way
let d = Math.random() < 0.5;
let k = null;
let y = {
  Object: {
    groupBy: v => v
  }
};
const {
  Object: {
    groupBy
  }
} = d ? y : k ?? globalThis;
export const viaNullishRight = groupBy([1, 2], v => v % 2);

// both operands non-proxy: no reachable global on the branch, nothing to inject
let e = Math.random() < 0.5;
let p = null;
let q = {
  Promise: {
    allSettled: v => v
  }
};
let z = {
  Promise: {
    allSettled: v => v
  }
};
const {
  Promise: {
    allSettled
  }
} = e ? p || q : z;
export const viaNonProxy = allSettled([]);

// NESTED logicals recurse: the innermost right-operand proxy still marks the leaf
let f2 = Math.random() < 0.5;
let m2 = null,
  k2 = null;
let x2 = {
  Iterator: {
    from: v => v
  }
};
const {
  Iterator: {
    from: iterFrom
  }
} = f2 ? m2 || (k2 ?? globalThis) : x2;
export const viaNestedRight = iterFrom([1, 2].values());