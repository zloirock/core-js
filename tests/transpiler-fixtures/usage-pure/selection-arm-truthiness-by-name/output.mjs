import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$race from "@core-js/pure/actual/promise/race";
import _Set from "@core-js/pure/actual/set/constructor";
// An arm of a selection keeps the OTHER arm live unless it is provably truthy, and only a KNOWN
// global constructor is that. An alias holding an unbacked key off the realm resolves to a name of
// its own and is undefined wherever the host lacks it, so the right operand still runs and still
// owes its mirror - calling such a name truthy collapsed the selection onto its left and took the
// right arm's polyfill with it. The realm alias is the positive control: there the right IS dead.
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
const viaRealm = _Promise$race;
export { viaUnbacked, viaProbe, viaRealm };