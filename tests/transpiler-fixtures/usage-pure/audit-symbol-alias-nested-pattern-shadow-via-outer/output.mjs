import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// the same-name INNER shadow off a user object still reads the user value while the outer
// same-file alias keeps its fold - the sibling records disambiguate positionally
const outerIt = _Symbol$iterator;
export const viaOuter = typeof _getIteratorMethod([]);