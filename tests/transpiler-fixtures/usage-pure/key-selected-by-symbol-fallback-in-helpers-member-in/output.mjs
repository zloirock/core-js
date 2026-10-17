import _isIterable from "@core-js/pure/actual/is-iterable";
import _Symbol from "@core-js/pure/actual/symbol";
const realm = _Symbol;
export const memberIn = receiver => _isIterable(receiver);