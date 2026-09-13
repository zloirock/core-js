import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
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
const at = _atMaybeArray((effI(), [1, 2]));
const {
  keys,
  ...rest
} = (effR(), _globalThis.Object);
export const r = [from, of, at, keys, rest];