// a user predicate narrowing to a STRUCTURAL target feeds member-chain resolution
interface F { ys: number[] }
function isF(o: unknown): o is F { return true; }
function gp(v: unknown) {
  if (isF(v)) {
    v.ys.at(0);
    v.ys.findLastIndex(x => !!x);
  }
}
