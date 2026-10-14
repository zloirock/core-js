import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
// An effectful computed key beside a leaf pure serves as its ponyfill splits the pattern around the key, and
// the leaf's default leaves with the rewrite all the same: a write in it reaches no later read.
let list = [1, 2];
const log = [];
const from = _Array$from;
const of = (_pushMaybeArray(log).call(log, 1), _Array$of);
export const last = _atMaybeArray(list).call(list, -1);
export const made = [from([5]), of(6), log];