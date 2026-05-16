import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
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
import "core-js/modules/web.dom-collections.iterator";
// IIFE wrapping a LogicalExpression `&&` fallback shape: `(() => Array && Iterator)()`.
// distinct branch shape from ConditionalExpression -- exercises
// `resolveAndDestructureMeta` recursion after IIFE peel. `&&` is always conditional
// (right taken only when left is truthy, else falsy left), so `fromFallback` always
// fires when left/right resolve to different objects. both Array.from and Iterator.from
// polyfills emitted via per-branch enumeration.
const {
  from
} = (() => Array && Iterator)();
from([1, 2]);