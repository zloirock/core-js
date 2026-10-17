import _Map from "@core-js/pure/actual/map";
{
  const {
    w: {
      Map: m
    }
  } = {
    ...extra,
    w: {
      Map: _Map
    }
  };
  use(m);
}