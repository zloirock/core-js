// two mapped-type renames that must NOT mint a narrower type than the source admits:
// several source keys renaming onto ONE target give that key the union of every colliding arm,
// and a rename that widens to bare `string` gives an index signature over the whole value union.
// minting one arm's type instead hands a family-specific helper to a value of another family
type Source = { arr: number[]; text: string; };

type Collapsed = { [K in keyof Source as 'both']: Source[K] };
declare const collapsed: Collapsed;
export const first = collapsed.both.at(0);

type Widened = { [K in keyof Source as string]: Source[K] };
declare const widened: Widened;
export const last = widened.arr.findLast(x => x);

type Kept = { [K in keyof Source as `x${K & string}`]: Source[K] };
declare const kept: Kept;
export const found = kept.xarr.includes(1);
