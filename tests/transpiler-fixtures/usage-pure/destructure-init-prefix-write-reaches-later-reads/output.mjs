import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _at from "@core-js/pure/actual/instance/at";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
var _ref;
// A write in the sequence prefix of a destructure init runs before the pattern binds anything.
// The rewrite consuming the whole pattern lifts that prefix ahead of the extraction, and every
// later read sees the write there: a constructor alias reads the written constructor's statics,
// a member read dispatches on the written value.
let Ctor = Array;
Ctor = _Map;
const from = _Array$from;
export const ctorGroupBy = _Map$groupBy;
const box = {
  items: [1, 2]
};
let of;
box.items = 'ab';
of = _Array$of;
export const last = _at(_ref = box.items).call(_ref, -1);
export const made = [from([3]), of(4)];