import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _Object$entries from "@core-js/pure/actual/object/entries";
var _ref;
// A side effect BURIED in a `+`-concat or template fold of a COMPUTED key (`X[(eff(), 'fr') + 'om']`,
// `` X[`fr${ (eff(), 'o') }m`] ``) must re-emit when the member collapses to a polyfill: the key folds to a
// static name and the whole member is replaced, so a fold-buried effect (unlike a top-level sequence
// prefix `[(eff(), 'from')]`, which was already preserved) was silently dropped on both emitters. covers
// static dispatch (receiver collapses), instance dispatch (key dropped, receiver memoized), template fold,
// and a receiver-HOP key on a static chain. distinct method per line so each import attributes to its line.
let log = [];
function k(name) {
  _pushMaybeArray(log).call(log, name);
}
const staticConcat = (k('a'), _Array$from)([1, 2]);
const instanceConcat = (k('b'), _atMaybeArray(_ref = [3, 4]).call(_ref, 0));
const staticTemplate = (k('c'), _Object$entries)({
  x: 1
});
const hopConcat = (k('d'), _Array$of)(5);
export { staticConcat, instanceConcat, staticTemplate, hopConcat, log };