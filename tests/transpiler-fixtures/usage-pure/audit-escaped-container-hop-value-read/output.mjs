import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Set from "@core-js/pure/actual/set";
import _WeakMap from "@core-js/pure/actual/weak-map";
import _WeakSet from "@core-js/pure/actual/weak-set";
// a VALUE read through a container hop that holds a proxy global resolves like every other
// position the same chain appears in. the escape a call argument (or a return) performs re-homes
// the slot the read LANDS on - `ns.g.Map`, not the `ns.g` it navigates through - so the receiver
// walk keeps descending the literal. the two negatives - a slot whose own value was handed out, and
// a slot this file replaced - are method-aware consults answered in usage-pure, which leaves both
// reads native; usage-global over-injects for either and locks only that the read reaches the
// realm. each row names its OWN global, or one row's family would answer for another's there
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
// the escaped slot ITSELF: `handed.a.b` was passed out, so a static read through it stays raw
const handed = {
  a: {
    b: Object
  }
};
hand(handed.a.b);
use(handed.a.b.groupBy([], item => item));
// the replaced slot: the literal no longer says what `rep.g` holds
const rep = {
  g: _globalThis
};
rep.g = {
  URL: null
};
hand(rep.g.URL);