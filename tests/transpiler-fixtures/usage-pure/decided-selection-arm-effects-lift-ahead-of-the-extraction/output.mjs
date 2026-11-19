import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// a selection the build decides behind an effect prefix runs the live arm's own effects before its value: an
// extraction landing ahead of the surviving residual lifts them with the outer prefix, so neither observes a
// binding the extraction wrote - over a ternary, an `&&` and a `||` left, in assignments and declarations
var groupBy, other;
eff('a');
eff('b');
groupBy = _Map$groupBy;
({
  other
} = _Map);
var from, size;
eff('c');
eff('d');
from = _Array$from;
({
  size
} = Array);
var of, length;
eff('e');
eff('f');
of = _Array$of;
({
  length
} = Array);
eff('g');
eff('h');
const attempt = _Promise$try;
const {
  prototype
} = _Promise;
export var x = 1;
eff('i');
eff('j');
export var fromEntries = _Object$fromEntries;
export var {
  prototype: objectPrototype
} = Object;
export { groupBy, other, from, size, of, length, attempt, prototype };