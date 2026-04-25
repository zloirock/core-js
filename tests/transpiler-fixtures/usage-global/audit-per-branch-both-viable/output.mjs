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
// usage-global: ConditionalExpression / LogicalExpression destructure where BOTH branches
// resolve to known globals with viable static deps for the destructured key. dispatch
// emits each branch's deps independently at file level - `cond ? Array : Iterator` for
// `from` brings in both `es.array.from` and `es.iterator.from`. body stays unchanged
function f({
  from
} = cond ? Array : Iterator) {
  return from;
}
const {
  from: g1
} = cond ? Array : Iterator;
let g2;
({
  from: g2
} = cond ? Array : Iterator);
export { f, g1, g2 };