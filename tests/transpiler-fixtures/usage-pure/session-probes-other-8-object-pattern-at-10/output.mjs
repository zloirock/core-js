import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
{
  const _ref = {
    w: [1, 2],
    z: 1
  };
  const m = _atMaybeArray(_ref.w);
  const {
    z
  } = _ref;
  use(m, z);
}