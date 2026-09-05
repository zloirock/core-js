import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// a carried init read THROUGH the TS assertions a source may spell around it: `as`, `satisfies` and
// the non-null operator are ERASED at runtime, so what they hold performs exactly the effects they
// do. the two legs' parsers disagree about which of these reach the tree at all, so a predicate
// reading the RAW node answers differently about one program - the peel is what makes them one
const arr = [3, [1, 2]];
const viaCastInit = _atMaybeArray(_flatMaybeArray(arr).call(arr));
const viaCastSlot = _atMaybeArray(_flatMaybeArray(arr).call(arr));
const viaNonNullInit = _atMaybeArray(_flatMaybeArray(arr).call(arr));
const viaSatisfiesInit = _atMaybeArray(_flatMaybeArray(arr).call(arr));
const viaCastElement = _atMaybeArray(_flatMaybeArray(arr).call(arr));
const viaCastWrapInit = _atMaybeArray(_flatMaybeArray(arr).call(arr));
const viaNonNullElement = _atMaybeArray(_flatMaybeArray(arr).call(arr));
export { viaCastInit, viaCastSlot, viaNonNullInit, viaSatisfiesInit };
export { viaCastElement, viaCastWrapInit, viaNonNullElement };