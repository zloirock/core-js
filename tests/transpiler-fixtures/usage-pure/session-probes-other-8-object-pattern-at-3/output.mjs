import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _at from "@core-js/pure/actual/instance/at";
const arr = [1, 2];
{
  const {
    w: {
      at: _unused
    }
  } = {
    ...spread,
    w: arr
  };
  const m = _atMaybeArray(arr);
  use(m);
}
{
  const _ref = {
    z: tick('z', 1),
    w: tick('w', arr)
  };
  const m = _at(_ref.w);
  const {
    z
  } = _ref;
  use(m, z);
}