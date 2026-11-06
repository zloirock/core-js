import _globalThis from "@core-js/pure/actual/global-this";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _self from "@core-js/pure/actual/self";
export function writtenAgainAfterThePair(flag) {
  var _ref;
  if (flag) {
    var W = _globalThis;
  } else {
    var W = _self;
  }
  if (flag) W = {};
  return _ref = W.Object, _ref === Object ? _Object$fromEntries([['d', 4]]) : _ref.fromEntries([['d', 4]]);
}