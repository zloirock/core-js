import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
// A symbol claim leaves adjacent constructor hops to the ordered residual split.
// Each native setter observes the source order in both statement and bodyless slots.
export function read(target, enabled) {
  ({
    customSet: target.left
  } = _Set);
  target.middle = _getIteratorMethod(_globalThis);
  ({
    customMap: target.right
  } = _Map);
  if (enabled) {
    ({
      customSet: target.left
    } = _Set);
    target.middle = _getIteratorMethod(_globalThis);
    ({
      customMap: target.right
    } = _Map);
  }
  if (enabled) var {
      customWeak
    } = _WeakMap,
    other = _getIteratorMethod(_globalThis),
    {
      customWeakSet
    } = _WeakSet;
  return [customWeak, other, customWeakSet];
}