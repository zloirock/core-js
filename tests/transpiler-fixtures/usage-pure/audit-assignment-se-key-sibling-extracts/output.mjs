import _Array$from from "@core-js/pure/actual/array/from";
import _joinMaybeArray from "@core-js/pure/actual/array/instance/join";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _Map from "@core-js/pure/actual/map/constructor";
// All assignment slots share the captured receiver and keep their key/write order.
// Receiver effects run once, before the first static binding; bound keys keep their claims.
const log = [];
const K = 'of';
let a, b, c, d, e, f, g, h, held;
_pushMaybeArray(log).call(log, 'recv'), b = _Array$of, _pushMaybeArray(log).call(log, 'k1'), a = _Array$from;
_pushMaybeArray(log).call(log, 'k2'), c = _Array$from, _pushMaybeArray(log).call(log, 'k3'), d = _Array$of;
held = _Map, _pushMaybeArray(log).call(log, 'k4'), e = _Array$from, f = _Array$of;
_pushMaybeArray(log).call(log, 'k5'), g = _Array$from, h = _Array$of;
export const r = [typeof a, typeof b, typeof c, typeof d, typeof e, typeof f, typeof g, typeof h, typeof held, _joinMaybeArray(log).call(log, ',')];