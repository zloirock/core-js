import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// the wrapper element MEMO holds the element AS WRITTEN: a TS cast or a non-null on it is the
// receiver's own spelling, and both legs keep it - memoizing the peeled view dropped it on one leg
// while the other kept it, a divergence the import set cannot see
const arr = [3, [1, 2]] as number[];
const _ref = _flatMaybeArray(arr).call(arr) as any;
const viaCast = _atMaybeArray(_ref);
const _ref2 = _flatMaybeArray(arr).call(arr)!;
const viaNonNull = _atMaybeArray(_ref2);
const _ref3 = _flatMaybeArray(arr).call(arr) satisfies unknown;
const viaSatisfies = _atMaybeArray(_ref3);
// ... and the same spelling rides the dispatch directly where no memo is minted
const viaFlatCast = _atMaybeArray(_flatMaybeArray(arr).call(arr) as any);
export { viaCast, viaNonNull, viaSatisfies, viaFlatCast };