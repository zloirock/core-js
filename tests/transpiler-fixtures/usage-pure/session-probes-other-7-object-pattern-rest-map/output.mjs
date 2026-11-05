import _globalThis from "@core-js/pure/actual/global-this";
// A literal wrapper keeps its native Map read while rest excludes the consumed outer key.
const rest = [];
{
  const {
    w: {
      Map: m
    },
    ...rest
  } = {
    w: _globalThis,
    z: 1
  };
  use(m, rest);
}