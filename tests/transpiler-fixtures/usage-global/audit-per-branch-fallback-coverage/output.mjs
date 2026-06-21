import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
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
// usage-global per-branch fallback dispatch: ternary / logical-or in destructure-receiver
// position. each branch's deps emit independently regardless of which branch is primary;
// body stays unchanged, only file-level imports differ from the no-fallback case.
// declaration init: ternary, both viable
const {
  from: a1
} = cond ? Array : Iterator;
// declaration init: ||, mixed (Array.from yes, userObj unknown - userObj contributes nothing)
const {
  from: a2
} = userObj || Array;
// declaration init: ??, member-call left contributes nothing, Iterator.from viable
const {
  from: a3
} = pickConstructor() ?? Iterator;
// assignment expression: ternary, multi-key destructure - both keys emit per branch
let b1, b2;
({
  from: b1,
  of: b2
} = cond ? Array : Iterator);
// default-value param (function param default): && reversed
function f({
  from
} = Array && Iterator) {
  return from;
}
export { a1, a2, a3, b1, b2, f };