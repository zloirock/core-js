// an arg-matched overload injects its precise family ONLY - es.string.at must be absent.
// isolated fixture: in a shared file any widen-form line using the same method would mask
// this absence in the deduplicated import set
interface Make {
  (x: number): number[];
  (x: string): string;
}
declare const make: Make;
export const viaArgMatched = make(5).at(0);
