// The index already supplies the static; its destructured alias still selects the iterator helper.
import S from '@core-js/pure/full/symbol';
const { iterator: key } = S;
const { iterator: defaulted = fallback } = S;
export const methods = [array[key], array[defaulted]];
export const iterable = key in array;

// An unrelated same-named binding must keep its own key.
export function custom(S) {
  const { iterator: key } = S;
  return array[key];
}
