import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise from "@core-js/pure/actual/promise/constructor";
var _ref, _ref2;
// an emptied pattern over an init that RUNS code keeps what runs, ahead of the binding it fed:
// a getter read replays whole, a realm call keeps the call and any effect before it - a prefix
// of the init or of the read's own root - and several lifted effects run as one statement
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
let n = 0;
let w;
_ref = Src.realm, _ref === _globalThis ? _Map : _ref.Map;
var g1 = _Map$groupBy;
log(), load();
var f2 = _Array$of;
log(), load();
var f3 = _Object$fromEntries;
if (log) {
  n++, w = (_ref2 = Src.realm, _ref2 === _globalThis ? _Promise : _ref2.Promise);
  var f4 = _Promise$allSettled;
}