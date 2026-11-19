import _globalThis from "@core-js/pure/actual/global-this";
// Native Map and Set reads share their original literal slot beside outer rest.
const rest = [];
{
  const {
    w: {
      Map: m,
      Set: s
    },
    ...rest
  } = {
    w: _globalThis,
    z: 1
  };
  use(m, s, rest);
}