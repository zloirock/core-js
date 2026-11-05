import _globalThis from "@core-js/pure/actual/global-this";
// A bound parameter key selects the literal default's own slot.
// Its nested Map extraction remains native.
{
  const boundKey = 'w';
  function boundKeyParam({
    [boundKey]: {
      Map: v
    }
  } = {
    w: _globalThis
  }) {
    return v;
  }
  use(boundKeyParam());
}