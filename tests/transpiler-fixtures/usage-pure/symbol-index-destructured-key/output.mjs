import _getIteratorMethod from "@core-js/pure/full/get-iterator-method";
import _isIterable from "@core-js/pure/full/is-iterable";
// The index already supplies the static; its destructured alias still selects the iterator helper.
import S from '@core-js/pure/full/symbol';
const {
  iterator: key
} = S;
const {
  iterator: defaulted = fallback
} = S;
export const methods = [_getIteratorMethod(array), _getIteratorMethod(array)];
export const iterable = _isIterable(array);

// An unrelated same-named binding must keep its own key.
export function custom(S) {
  const {
    iterator: key
  } = S;
  return array[key];
}