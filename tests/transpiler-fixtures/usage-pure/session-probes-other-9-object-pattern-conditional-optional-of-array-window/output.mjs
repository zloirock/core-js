import _globalThis from "@core-js/pure/actual/global-this";
import _Set from "@core-js/pure/actual/set/constructor";
const c = 1;
{
  const {
    a: {
      of: v
    }
  } = {
    a: c ? _globalThis.window?.Array : _Set
  };
}