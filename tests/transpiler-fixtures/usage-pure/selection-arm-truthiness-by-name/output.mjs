import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$race from "@core-js/pure/actual/promise/race";
import _Set from "@core-js/pure/actual/set/constructor";
// An arm of a selection keeps the OTHER arm live unless it is provably truthy: a KNOWN global
// constructor, the realm, a static container. An alias holding an unbacked key off the realm resolves
// to a name of its own and is undefined wherever the host lacks it, so the right operand still runs
// and still owes its mirror - calling such a name truthy collapsed the selection onto its left and
// took the right arm's polyfill with it. The realm alias is the positive control: there the right IS dead.
const unbacked = _globalThis.shim;
const {
  Array: {
    from: viaUnbacked
  }
} = unbacked || {
  Array: {
    from: _Array$from
  }
};
const probe = _globalThis.window;
const {
  customQ: viaProbe
} = _Set;
const realm = _globalThis;
const {
  Promise: {
    race: viaRealm
  }
} = {
  Promise: {
    race: _Promise$race
  }
};
// A static container is truthy too - a name bound to a literal, or to a call the call canon proves
// to yield one - so the right arm beside it is dead text on both legs, not a mirror of the realm.
const held = {
  Array: {
    from: () => []
  }
};
const {
  Array: {
    from: viaHeld
  }
} = held || _globalThis;
const build = () => ({
  Array: {
    from: () => []
  }
});
const built = build();
const {
  Array: {
    from: viaBuilt
  }
} = built || _globalThis;
const {
  Array: {
    from: viaCall
  }
} = build() || _globalThis;
export { viaUnbacked, viaProbe, viaRealm, viaHeld, viaBuilt, viaCall };