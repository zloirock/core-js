import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
var _ref;
// A conditional or deferred alias write provides only a possible realm value.
// Pure guards its live constructor read, preserving an uninitialized-alias throw
// and the static on a matching value. Only an always-evaluated guard write proves
// the alias strongly enough for a direct fold.
var _g;
var _h;
var _i;
export const inArm = (c ? _g = _globalThis : 1) ? (_g === _globalThis ? _Map : _g.Map).groupBy([1], x => x) : 0;
export const inBody = (h = function () {
  _h = _globalThis;
}) ? (_ref = _h.Object, _ref === Object ? _Object$fromEntries([]) : _ref.fromEntries([])) : 0;
export const onSpine = (_i = _globalThis) == null ? void 0 : _Array$of(3);