import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// the wrapper element MEMO holds the element AS WRITTEN: a TS cast or a non-null on it is the
// receiver's own spelling, and both legs keep it - memoizing the peeled view dropped it on one leg
// while the other kept it, a divergence the import set cannot see
const arr = [3, [1, 2]] as number[];
const viaCast = _atMaybeArray(_flatMaybeArray(arr).call(arr) as any);
const viaNonNull = _atMaybeArray(_flatMaybeArray(arr).call(arr)!);
const viaSatisfies = _atMaybeArray(_flatMaybeArray(arr).call(arr) satisfies unknown);
// ... and the same spelling rides the dispatch directly where no memo is minted
const viaFlatCast = _atMaybeArray(_flatMaybeArray(arr).call(arr) as any);
export { viaCast, viaNonNull, viaSatisfies, viaFlatCast };