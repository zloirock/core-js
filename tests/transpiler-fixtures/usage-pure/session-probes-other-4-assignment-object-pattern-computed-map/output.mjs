import _Map from "@core-js/pure/actual/map";
const k = 'k';
{
  const k = 'w';
  let m;
  ({
    [k]: {
      Map: m
    }
  } = {
    w: {
      Map: _Map
    }
  });
  use(m);
}