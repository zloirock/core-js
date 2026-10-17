import _Map from "@core-js/pure/actual/map";
const rest = [];
{
  let m, rest;
  ({
    w: {
      Map: m
    },
    ...rest
  } = {
    w: {
      Map: _Map
    },
    z: 1
  });
  use(m, rest);
}