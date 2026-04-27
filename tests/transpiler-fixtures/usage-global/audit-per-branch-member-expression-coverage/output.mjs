import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
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
import "core-js/modules/web.dom-collections.iterator";
// per-branch dispatch when fallback receivers are MemberExpressions, not bare Identifiers.
// resolveObjectName already accepts proxy-global member chains; enumerateFallbackDestructureBranches
// must peel paren wrappers (oxc preserves) and accept MemberExpression branches so each
// branch's deps emit independently. without the per-branch peel, only one branch's polyfill
// reaches the file-level imports
const {
  from: a
} = cond ? globalThis.Array : globalThis.Iterator;
const {
  from: b
} = userFn() || globalThis.Array;
const {
  of: c
} = cond ? Iterator : globalThis.Array;
export { a, b, c };