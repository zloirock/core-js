import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// a carried init read THROUGH the parens a source may spell around it: they are ERASED at runtime,
// so what they hold performs exactly the effects they do - and the leg whose parser KEEPS the node
// must not answer differently from the one that drops it
const arr = [3, [1, 2]];
const hb = {
  get y() {
    return [3, [1, 2]];
  }
};
const viaParenSlot = _atMaybeArray(_flatMaybeArray(arr).call(arr));
const viaParenInit = _atMaybeArray(_flatMaybeArray(arr).call(arr));
const viaParenWrapSlot = _atMaybeArray(_flatMaybeArray(arr).call(arr)); // ... and the wrapper HOST reads through them too, narrow included: the alias walk that decides
// whether the element leaks climbs to its declarator, and a fixed hop count - or an init matched by
// identity - answers `leak` on the leg whose parser keeps the paren, which costs the read its type
const viaParenWrapInit = _atMaybeArray(hb.y);
const [{}, viaParenWrapTail] = [hb, arr];
const [{}, viaParenWrapPairTail] = [hb, _flatMaybeArray(arr).call(arr)];
const _ref = hb.y;
const viaParenWrapPair = _atMaybeArray(_ref);
const viaParenWrapPairLast = _findLastMaybeArray(_ref);
export { viaParenSlot, viaParenInit, viaParenWrapSlot };
export { viaParenWrapInit, viaParenWrapTail, viaParenWrapPair, viaParenWrapPairLast, viaParenWrapPairTail };