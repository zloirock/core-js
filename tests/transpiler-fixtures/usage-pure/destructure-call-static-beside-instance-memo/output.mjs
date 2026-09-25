import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// a pattern reading a static and an instance member off a value it must evaluate once - a call, a
// getter, a sequence ending in either - memoizes that value AHEAD of both reads: the static binds its
// polyfill, the instance member dispatches on the memo, and no read precedes the memo's declaration
function make() {
  return _Map;
}
const _ref = make();
const fromCall = _Map$groupBy;
const callName = _nameMaybeFunction(_ref);
class Holder {
  static get made() {
    return _Promise;
  }
}
const _ref2 = Holder.made;
const fromGetter = _Promise$try;
const getterName = _nameMaybeFunction(_ref2);
let n = 0;
const _ref3 = (n++, make2());
const fromSequence = _Iterator$from;
const sequenceName = _nameMaybeFunction(_ref3);
function make2() {
  return _Iterator;
}
use(fromCall, callName, fromGetter, getterName, fromSequence, sequenceName, n);