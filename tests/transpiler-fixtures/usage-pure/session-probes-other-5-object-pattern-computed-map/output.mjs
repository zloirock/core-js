import _globalThis from "@core-js/pure/actual/global-this";
// A literal computed string key preserves the native nested Map read of its object slot.
{
  const {
    ['w']: {
      Map: m
    }
  } = {
    w: _globalThis
  };
  use(m);
}