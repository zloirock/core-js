import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// An ArrayPattern consumes the current iterator. A numeric ObjectPattern key
// reads an indexed property and retains its independent Array family.
Array.prototype[_Symbol$iterator] = function* () {
  yield 'text';
};
const [value] = [[1]];
export const iterated = _at(value).call(value, 0);
const {
  0: indexed
} = [[1]];
export const property = _includesMaybeArray(indexed).call(indexed, 1);