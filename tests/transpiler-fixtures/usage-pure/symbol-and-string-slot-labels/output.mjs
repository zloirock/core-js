import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// A symbol key and a string resembling its internal label name distinct properties.
// The default mirror must retain both reads and polyfill the instance method.
const row = [1, 2];
Object.defineProperty(row, '[@@iterator]', {
  get() {
    return 7;
  }
});
export function read({
  [_Symbol$iterator]: iter,
  '[@@iterator]': tag,
  at
} = {
  [_Symbol$iterator]: _getIteratorMethod(row),
  '[@@iterator]': row['[@@iterator]'],
  at: _atMaybeArray(row)
}) {
  return [tag, at.call(row, -1), iter.call(row).next().value];
}