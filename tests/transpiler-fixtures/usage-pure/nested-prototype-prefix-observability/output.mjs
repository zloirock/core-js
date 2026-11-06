import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _sortMaybeArray from "@core-js/pure/actual/array/instance/sort";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// A rebuilt nested prototype receiver drops only unobservable prefix reads.
// Getter and write prefixes still execute once before method extraction.
const quiet = {
  value: 0
};
const sort = _sortMaybeArray(Array.prototype);
const observed = {
  get value() {
    effect();
    return 0;
  }
};
const at = _atMaybeString((observed.value, String.prototype));
const includes = _includesMaybeArray((count++, Array.prototype));
use(sort, at, includes);