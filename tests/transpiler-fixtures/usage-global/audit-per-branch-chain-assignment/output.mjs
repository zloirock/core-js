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
// chain assignment `const { from } = foo = cond ? Array : Iterator` - AssignmentExpression
// evaluates to its RHS, destructure targets the conditional value. usage-global peels
// through `=` chains in `enumerateFallbackBranches` and emits per-branch deps for ALL viable
// constructors regardless of how deep the chain goes. body stays unchanged
let foo, bar, x, y;
const {
  from: a
} = foo = cond ? Array : Iterator;
({
  from: b
} = bar = cond ? Array : Iterator);
const {
  from: c
} = x = y = cond ? Array : Iterator;
console.log(a, b, c, foo, bar, x, y);