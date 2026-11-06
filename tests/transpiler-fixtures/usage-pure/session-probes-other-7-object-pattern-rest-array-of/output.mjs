import _globalThis from "@core-js/pure/actual/global-this";
// A literal wrapper keeps its native nested Array.of read and outer rest exclusion.
const rest = [];
{
  const {
    w: {
      Array: {
        of: m
      }
    },
    ...rest
  } = {
    w: _globalThis,
    z: 1
  };
  use(m, rest);
}