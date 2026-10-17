import _Map from "@core-js/pure/actual/map";
import _Set from "@core-js/pure/actual/set";
const rest = [];
{
  const {
    w: {
      Map: m,
      Set: s
    },
    ...rest
  } = {
    w: {
      Map: _Map,
      Set: _Set
    },
    z: 1
  };
  use(m, s, rest);
}