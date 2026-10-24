import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// A static leaf under a literal wrapper keeps the alias read that may throw.
// The initializer's independent instance claim remains live before that read.
const held = _globalThis.window;
const [{
  of
}] = [((_pushMaybeArray(log) || 0).call(log, _atMaybeArray(_ref = [7]).call(_ref, 0)), held.Array)];
export const result = of(7);