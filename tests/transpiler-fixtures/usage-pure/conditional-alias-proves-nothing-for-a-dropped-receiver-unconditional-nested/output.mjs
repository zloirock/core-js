import _globalThis from "@core-js/pure/actual/global-this";
import _Object$entries from "@core-js/pure/actual/object/entries";
// ... and the same four off an alias whose assignment DOMINATES every read
export function unconditionalNested() {
  var G = _globalThis;
  const {
    Object: {
      entries
    }
  } = {
    Object: {
      entries: _Object$entries
    }
  };
  return entries({
    a: 1
  });
}