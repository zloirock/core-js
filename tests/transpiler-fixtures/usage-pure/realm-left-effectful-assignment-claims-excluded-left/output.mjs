import _DisposableStack from "@core-js/pure/actual/disposable-stack/constructor";
import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
// A destructuring ASSIGNMENT whose init runs code claims the static off a `||` / `??` left read off the
// realm even where that left decides nothing (`Map`, its constructor entry excluded, while `groupBy` keeps its
// own): both operands, each polyfilled, stay ahead of the claim as written - in a bodyless slot, which becomes
// a block, and in a sequence element too.
let groupBy, grouped, byKey;
_globalThis.Map || (log(), _WeakSet);
groupBy = _Map$groupBy;
if (ok) {
  _globalThis.Map || (log(), _Iterator);
  grouped = _Map$groupBy;
}
export const keyed = (_globalThis.Map ?? (make(), _DisposableStack), byKey = _Map$groupBy, byKey(list, key));
export { groupBy, grouped };