import _Array$from from "@core-js/pure/actual/array/from";
import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise";
import _Promise$any from "@core-js/pure/actual/promise/any";
var _ref;
// A `||` / `??` left read off the realm - directly, through an alias, a destructured binding or a call
// returning it - decides the selection only where the build serves its global: an engine lacking it runs
// the right, which keeps its mirror (`of`, `any`, `fromAsync`), and a member read over it takes the right's
// static through the identity guard. A served realm read still decides (only its effect stays), and a bare
// name an engine lacks throws first - read directly, through an alias or a call returning it.
const list = [1, 2];
export const viaMember = (_ref = _globalThis.WeakRef || Array, _ref === Array ? _Array$from(list) : _ref.from(list));
const {
  of
} = _globalThis.FinalizationRegistry ?? {
  of: _Array$of
};
export { of };
let reads = 0;
reads++;
const groupBy = _Map$groupBy;
export { groupBy };
export const viaBare = WeakRef.fromEntries([['k', 1]]);
const BareRef = WeakRef;
export const viaBareAlias = BareRef.entries({
  k: 2
});
function getBareRef() {
  return WeakRef;
}
export const viaBareCall = getBareRef().hasOwn({
  k: 3
}, 'k');
const Ref = _globalThis.WeakRef;
export const viaAlias = (Ref || _Promise).allSettled(list);
const {
  FinalizationRegistry: Registry
} = _globalThis;
const {
  any
} = Registry ?? {
  any: _Promise$any
};
export { any };
function getRef() {
  return _globalThis.WeakRef;
}
const {
  fromAsync
} = getRef() || {
  fromAsync: _Array$fromAsync
};
export { fromAsync };