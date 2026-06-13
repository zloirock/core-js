import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$keys from "@core-js/pure/actual/object/keys";
// the dead-tail drop applies to fully-static full-consume patterns; each line below
// probes one boundary:
// a bodyless host block-wraps and trims like any other lift
if (cond) {
  effB();
  var from = _Array$from;
}
// a for-init head can't host a statement-level SE
for (var _ref = (effF(), Array), of = _Array$of;;) break;
// an instance entry needs the receiver at runtime
const at = _atMaybeArray((effI(), [1, 2])); // a rest element consumes the whole object
const keys = _Object$keys;
const {
  keys: _unused,
  ...rest
} = (effR(), _globalThis.Object);
export const r = [from, of, at, keys, rest];