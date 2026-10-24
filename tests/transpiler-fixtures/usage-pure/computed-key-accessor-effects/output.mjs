import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// A getter in a folded computed key still runs at its original pattern slot.
// Static declarations, assignments and symbol reads preserve one key read each.
// A quiet data property retains the ordinary key-elision path.
const log = [];
const key = {
  get value() {
    _pushMaybeArray(log).call(log, 'key');
    return 0;
  }
};
const from = (key.value, _Array$from);
let of;
key.value, of = _Array$of;
let iterator;
key.value, iterator = _getIteratorMethod([1]);
const quiet = {
  value: 0
};
const {
  [(quiet.value, 'isArray')]: isArray
} = Array;
export { from, of, iterator, isArray, log };