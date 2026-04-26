import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
import _Symbol$asyncIterator from "@core-js/pure/actual/symbol/async-iterator";
// `obj[Symbol.iterator] = fn` is a write to a computed key, not a value access -
// is-iterable / iteration-protocol routing is skipped in assignment target position.
// The well-known symbol values themselves are still polyfilled.
obj[_Symbol$iterator] = fn;
obj[_Symbol$asyncIterator] = fn;