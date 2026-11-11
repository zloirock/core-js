import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
// Memoizing one receiver preserves later static claims and evaluates the initializer
// before any binding. Native siblings keep their original position between extractions.
// Bare and proxy-global constructors retain the same static coverage.
const eff = () => {};
function arrayCtor() {
  return Array;
}
const _ref = arrayCtor();
export const name = _nameMaybeFunction(_ref);
export const of = _Array$of;
eff();
export const seqOf = _Array$of;
export const seqName = _nameMaybeFunction(Array);
export const seqFrom = _Array$from;
const _ref2 = (eff(), Array);
export const n2 = _nameMaybeFunction(_ref2);
export const {
  length: l2
} = _ref2;

// NEGATIVE: an un-memoized bare constructor never lost them
export const o2 = _Array$of;
export const bareName = _nameMaybeFunction(Array);
export const bareOf = _Array$of;
// NEGATIVE: a proxy-global member receiver already registered its constructor
const _ref3 = _globalThis.Array;
export const navName = _nameMaybeFunction(_ref3);
export const navOf = _Array$of;