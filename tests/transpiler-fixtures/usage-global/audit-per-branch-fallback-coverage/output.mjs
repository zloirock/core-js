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
import "core-js/modules/web.dom-collections.iterator";
// usage-global per-branch fallback dispatch: ConditionalExpression / LogicalExpression
// in destructure-receiver position. each branch's deps emit independently regardless of
// which branch the resolver picked as primary. body stays unchanged - only file-level
// imports differ from the no-fallback case
//
// VariableDeclarator init: ternary, both viable
const {
  from: a1
} = cond ? Array : Iterator;
// VariableDeclarator init: ||, mixed (Array.from yes, userObj unknown - userObj contributes nothing)
const {
  from: a2
} = userObj || Array;
// VariableDeclarator init: ??, member-call left contributes nothing, Iterator.from viable
const {
  from: a3
} = pickConstructor() ?? Iterator;
// AssignmentExpression: ternary, multi-key destructure - both keys emit per branch
let b1, b2;
({
  from: b1,
  of: b2
} = cond ? Array : Iterator);
// AssignmentPattern (function param default): && reversed
function f({
  from
} = Array && Iterator) {
  return from;
}
export { a1, a2, a3, b1, b2, f };