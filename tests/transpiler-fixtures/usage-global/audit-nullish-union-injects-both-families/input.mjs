// usage-global twin of the nullish-drop folds: a union whose nullish path yields the other
// family must inject BOTH families' entries (over-inject-safe), not just the truthy arm's.
// one method per line keeps each fold's contribution attributable in the import set;
// the destructuring-member sibling lives in its own fixture for the same reason
declare const r: number[] | null;
declare const arr: number[];
declare const s: string;
export const viaAndOr = ((r && arr) || s).at(1);

declare const c: boolean;
function f(cond: boolean) {
  if (cond) return [1, 2];
}
export const viaFallThrough = (f(c) ?? 'fallback').includes(1);
