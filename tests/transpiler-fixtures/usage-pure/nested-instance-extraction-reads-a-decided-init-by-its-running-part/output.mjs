import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// a nested instance read extracts off a slot whose value runs code where the init's running part performs
// nothing else, as that init spelled without what the build decides: a call or a construction in a decided
// container's slot, an effect ahead of the decided arm, a fresh-object `||` left, a quiet comma and a store
// in a decided slot. a sibling slot whose live arm runs an effect keeps the read native
export const at = _at(getArr());
export const toReversed = _toReversedMaybeArray(new Array(2));
export const findLast = _findLastMaybeArray((mark(), []));
export const flat = _flatMaybeArray((mark(), []));
export const includes = _includes(getArr());
var B;
export const toSorted = _toSortedMaybeArray(B = []);
export { B };
export const {
  H: {
    with: replaced
  }
} = {
  H: getArr(),
  I: mark()
};