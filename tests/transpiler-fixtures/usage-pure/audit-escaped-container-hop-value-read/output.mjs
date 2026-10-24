import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Set from "@core-js/pure/actual/set";
import _WeakMap from "@core-js/pure/actual/weak-map";
import _WeakSet from "@core-js/pure/actual/weak-set";
// Reading a constructor through a container preserves its global claim.
// Escaping a nested value does not replace its parent slot.
// A fresh replacement removes the old realm candidate; its URL stays null.
const ns = {
  g: _globalThis
};
hand(_Map);
const nested = {
  a: {
    g: _globalThis
  }
};
hand(_Set);
const boxes = [{
  g: _globalThis
}];
hand(_WeakMap);
export function taken() {
  return _WeakSet;
}
// the escaped VALUE: passing `handed.a.b` out replaces no slot of `handed`, so a static read through
// it resolves as its flat spelling does (`hand(Object); Object.groupBy`)
const handed = {
  a: {
    b: Object
  }
};
hand(handed.a.b);
use(_Object$groupBy([], item => item));
// the replaced slot: the literal no longer says what `rep.g` holds
const rep = {
  g: _globalThis
};
rep.g = {
  URL: null
};
hand(rep.g.URL);