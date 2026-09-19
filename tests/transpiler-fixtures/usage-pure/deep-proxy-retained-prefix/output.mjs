import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
// Collapsing a deep proxy receiver must retain the prefix and its own static claim.
// The prefix runs before the outer call, and both statics need separate polyfills.
const effects = [];
const result = (_pushMaybeArray(effects).call(effects, _Array$of('prefix')[0]), _Array$from)([7]);