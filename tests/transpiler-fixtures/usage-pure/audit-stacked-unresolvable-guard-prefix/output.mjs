import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// STACKED unresolvable hops under an SE key: the guard tests the probe alone (`_globalThis.window`) -
// the second `window` is a realm self-reference no read can find absent, so it earns no test of its
// own, and the key's effect still runs only past the short-circuit, where the source runs it.
const log = [];
const v = null == _globalThis.window ? void 0 : _atMaybeArray(_ref = (_pushMaybeArray(log).call(log, "k"), _Array$of)(7)).call(_ref, 0);
use(v, log);