import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
// resolvePropertyObjectType walks `path.get('object')` for member access. When `arr` is
// the result of an aliased static-method call (`from(...)` with `from = Array.from`),
// the `object` resolution must follow through the alias to recognise Array. Tests that
// optional chaining shape (arr?.method) routes through the same path, and the receiver
// is narrowed at both call sites with distinct methods.
const from = _Array$from;
const arr = from('xyz');
arr == null ? void 0 : _atMaybeArray(arr).call(arr, -1);
arr == null ? void 0 : _findLastMaybeArray(arr).call(arr, x => x);