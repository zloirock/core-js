import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
// The receiver runs before the first static write; the next key observes that write.
const events = [];
let from,
  of = 'old';
_pushMaybeArray(events).call(events, ['rhs', of]), of = _Array$of, _pushMaybeArray(events).call(events, ['key', typeof of]), from = _Array$from;
use(from([7]), of(8), events);