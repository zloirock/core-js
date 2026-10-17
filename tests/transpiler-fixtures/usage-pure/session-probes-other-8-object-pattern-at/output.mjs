import _at from "@core-js/pure/actual/instance/at";
const arr = [1, 2];
const nb = {
  y: arr
};
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