import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
const rest = [];
{
  const {
    w: {
      Map: m,
      keep
    },
    ...rest
  } = {
    w: {
      Map: _Map,
      keep: _globalThis.keep
    },
    z: 1
  };
  use(m, keep, rest);
}