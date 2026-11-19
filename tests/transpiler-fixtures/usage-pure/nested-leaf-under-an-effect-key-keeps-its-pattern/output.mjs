import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
// A computed hop evaluates its key once before capturing the nested receiver.
// Native siblings and polyfilled method reads then follow in their original order.
function rows(box, touch) {
  const {
      [(touch(), 'y')]: _ref
    } = null == box ? box[""] : box,
    {
      other: {
        q
      }
    } = _ref,
    at = _at(_ref);
  const k = box.k,
    {
      [(touch(), 'z')]: _ref2
    } = box,
    {
      more: {
        r
      }
    } = _ref2,
    flat = _flatMaybeArray(_ref2);
  return [q, at, k, r, flat];
}
use(rows);