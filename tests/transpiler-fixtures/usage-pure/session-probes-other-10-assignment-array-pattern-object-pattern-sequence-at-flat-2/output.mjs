import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
const arr = [1, 2];
{
  var _ref;
  let out, e;
  [_ref] = [(out = 1, _flatMaybeArray(arr).call(arr))];
  e = _atMaybeArray(_ref);
  use(e, out);
}