import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
// A stored call yield remains the value tested by the optional guard.
// Prefix, key and argument effects keep their source order on both branches.
const read = () => _globalThis.window;
let held;
null == (_pushMaybeArray(log).call(log, 'prefix'), held = read()) ? void 0 : (_pushMaybeArray(log).call(log, 'key'), _Array$from((_pushMaybeArray(log).call(log, 'argument'), [8])));
held;