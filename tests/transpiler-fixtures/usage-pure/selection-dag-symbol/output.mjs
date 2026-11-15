import _getIterator from "@core-js/pure/actual/get-iterator";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// Agreement retains symbol provenance through shared alias arms.
const k0 = _Symbol$iterator;
const k1 = _Symbol$iterator;
const k2 = first() ? k1 : k0;
const k3 = second() ? k2 : k1;
_getIterator([3]);