import _Map from "@core-js/pure/actual/map";
{
  const boundKey = 'w';
  function boundKeyParam({
    [boundKey]: {
      Map: v
    }
  } = {
    w: {
      Map: _Map
    }
  }) {
    return v;
  }
  use(boundKeyParam());
}