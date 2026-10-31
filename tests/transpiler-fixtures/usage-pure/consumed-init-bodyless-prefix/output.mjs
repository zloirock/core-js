import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// Source siblings surround a fully consumed initializer; its child claims stay live.
if (ready) {
  var before = hit('before');
  hit(typeof from, _Array$from([1])[0]);
  var from = _Array$from;
  var of = _Array$of;
  var after = hit('after');
}
if (ready) var left = hit('left'),
  at = _atMaybeArray((hit(_Array$from([3])[0]), _globalThis.Array.prototype)),
  right = hit('right');