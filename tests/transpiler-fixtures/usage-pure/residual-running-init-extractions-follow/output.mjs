import _Array$from from "@core-js/pure/actual/array/from";
import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator$concat from "@core-js/pure/actual/iterator/concat";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
var _ref;
// a residual whose init RUNS code - a call, a getter, an effect inside the read - evaluates it
// before the pattern binds anything: every extraction follows that residual, which keeps its own
// prefix - on a sole or sibling declarator, in a loop head, behind an assignment, when exported
function load() {
  log();
  return _globalThis;
}
class Src {
  static get realm() {
    log();
    return _globalThis;
  }
}
var {
  other: o1
} = load().Array;
var f1 = _Array$from;
var a = 1;
var {
  other: o2
} = (_ref = Src.realm, _ref === _globalThis ? _Map : _ref.Map);
var g2 = _Map$groupBy;
for (var i = 0, {
    other: o3
  } = (log(), _globalThis).Array, f3 = _Array$of; i < 1; i++);
for (var j = 0, {
    other: o8
  } = (log(), load().Array), f8 = _Array$fromAsync; j < 1; j++);
for (var {
    other: o4
  } = load().Object, f4 = _Object$fromEntries; !f4;) break;
var f5, t5, o5;
({
  other: o5
} = (log(), load(), _Promise));
f5 = _Promise$allSettled;
t5 = _Promise$try;
export var {
  other: o6
} = Src.realm.Object;
export var f6 = _Object$hasOwn;
var {
  other: o7
} = (load(), _Iterator);
var f7 = _Iterator$concat;