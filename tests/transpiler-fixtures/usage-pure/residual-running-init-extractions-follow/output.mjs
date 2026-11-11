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
var _ref2;
// A call, getter or buried effect in the initializer runs once before any binding.
// Capturing that value lets extracted bindings precede their following native siblings
// in declarations, loop heads, assignments and exports.
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
var _ref = load().Array,
  f1 = _Array$from,
  {
    other: o1
  } = _ref;
var a = 1,
  _ref3 = (_ref2 = Src.realm, _ref2 === _globalThis ? _Map : _ref2.Map),
  g2 = _Map$groupBy,
  {
    other: o2
  } = _ref3;
for (var i = 0, _ref4 = (log(), _globalThis).Array, f3 = _Array$of, {
    other: o3
  } = _ref4; i < 1; i++);
for (var j = 0, _ref5 = (log(), load().Array), f8 = _Array$fromAsync, {
    other: o8
  } = _ref5; j < 1; j++);
for (var _ref6 = load().Object, f4 = _Object$fromEntries, {
    other: o4
  } = _ref6; !f4;) break;
var f5, t5, o5;
log(), load(), f5 = _Promise$allSettled, t5 = _Promise$try, {
  other: o5
} = _Promise;
var _ref7 = Src.realm.Object,
  f6 = _Object$hasOwn,
  {
    other: o6
  } = _ref7;
export { f6, o6 };
load();
var f7 = _Iterator$concat,
  {
    other: o7
  } = _Iterator;