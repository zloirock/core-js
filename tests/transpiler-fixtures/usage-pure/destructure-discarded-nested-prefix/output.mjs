import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
// Removing the static pattern keeps both initializer effects in source order.
// Its property default stays dead; the nested claim in the prefix remains live.
const events = [];
_pushMaybeArray(events).call(events, 'outer'), (_pushMaybeArray(events) || 0).call(events, _Array$of('inner')[0]);
const read = _Array$from;
export { read, events };