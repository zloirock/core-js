import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
// Identifier `arr1` is a prefix of `arr10` - different bindings, same string prefix.
// nth-occurrence must locate `.at(...)` on the right receiver. Three different methods
// to ensure each polyfill picks its own emission slot
_at(arr1).call(arr1, -1);
_findLastMaybeArray(arr10).call(arr10, p);
_flatMaybeArray(arr1).call(arr1);