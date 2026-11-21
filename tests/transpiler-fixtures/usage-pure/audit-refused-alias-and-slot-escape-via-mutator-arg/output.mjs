import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Map from "@core-js/pure/actual/map/constructor";
// A push into the same array makes the slot readable. This native slot read
// observes the narrow Map constructor used for a builtin mutator argument.
const installed = [];
_pushMaybeArray(installed).call(installed, _Map);
export const viaMutatorArg = typeof installed[0].groupBy;