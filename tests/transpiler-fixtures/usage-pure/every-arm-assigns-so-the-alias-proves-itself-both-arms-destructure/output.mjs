import _globalThis from "@core-js/pure/actual/global-this";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _self from "@core-js/pure/actual/self";
export function bothArmsDestructure(flag) {
  if (flag) {
    var H = _globalThis;
  } else {
    var H = _self;
  }
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