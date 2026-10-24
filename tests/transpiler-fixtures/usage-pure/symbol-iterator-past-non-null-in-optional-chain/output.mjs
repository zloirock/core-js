import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _getIterator from "@core-js/pure/actual/get-iterator";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// A `!` inside an open chain continues it into a Symbol.iterator lookup: the receiver's `?.` guards
// the iterator helper and the links after it, whether the assertion stands on the receiver or
// between the lookup and its call. Parens around the chain still seal it: the helper reads the
// short-circuit's value and throws on it as the source does.
declare const strs: string[] | null;
strs == null ? void 0 : _getIterator(_atMaybeArray(strs).call(strs, -1)!).next();
strs == null ? void 0 : _getIteratorMethod(strs[0]!!);
strs == null ? void 0 : _getIterator(strs).next();
_getIterator((strs?.[2])!).next();
_getIterator(strs?.[3]!);