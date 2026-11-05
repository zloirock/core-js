import _globalThis from "@core-js/pure/actual/global-this";
// An object spread completes before the explicit realm slot is read by the native pattern.
{
  const {
    w: {
      Map: m
    }
  } = {
    ...extra,
    w: _globalThis
  };
  use(m);
}