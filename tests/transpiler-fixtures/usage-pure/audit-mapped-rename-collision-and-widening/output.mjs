import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2, _ref3;
// two mapped-type renames that must NOT mint a narrower type than the source admits:
// several source keys renaming onto ONE target give that key the union of every colliding arm,
// and a rename that widens to bare `string` gives an index signature over the whole value union.
// minting one arm's type instead hands a family-specific helper to a value of another family
type Source = {
  arr: number[];
  text: string;
};
type Collapsed = { [K in keyof Source as 'both']: Source[K] };
declare const collapsed: Collapsed;
export const first = _at(_ref = collapsed.both).call(_ref, 0);
type Widened = { [K in keyof Source as string]: Source[K] };
declare const widened: Widened;
export const last = _findLastMaybeArray(_ref2 = widened.arr).call(_ref2, x => x);
type Kept = { [K in keyof Source as `x${K & string}`]: Source[K] };
declare const kept: Kept;
export const found = _includesMaybeArray(_ref3 = kept.xarr).call(_ref3, 1);