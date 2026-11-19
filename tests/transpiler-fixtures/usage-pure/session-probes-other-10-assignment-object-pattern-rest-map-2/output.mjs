import _globalThis from "@core-js/pure/actual/global-this";
// A literal-object assignment keeps its native Map read and rest exclusion.
const rest = [];
{
  let m, rest;
  ({
    w: {
      Map: m
    },
    ...rest
  } = {
    w: _globalThis,
    z: 1
  });
  use(m, rest);
}