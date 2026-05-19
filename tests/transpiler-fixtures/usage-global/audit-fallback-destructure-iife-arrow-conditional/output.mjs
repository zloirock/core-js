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
import "core-js/modules/esnext.iterator.chunks";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/esnext.iterator.join";
import "core-js/modules/esnext.iterator.windows";
import "core-js/modules/web.dom-collections.iterator";
// fallback destructure receiver wrapped in zero-arg arrow-expression-body IIFE:
// `(() => cond ? Array : Iterator)()`. without IIFE peel `buildDestructuringInitMeta`
// sees the CallExpression and bails to `object: null`, so the `fromFallback` flag never
// fires and `enumerateFallbackDestructureBranches` skips per-branch dispatch. with the
// peel the conditional reaches `resolveConditionalDestructureMeta`, both branches
// (Array.from + Iterator.from) get enumerated and their es.* polyfills emitted.
const {
  from
} = (() => cond ? Array : Iterator)();
from([1, 2]);