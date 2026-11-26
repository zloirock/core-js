interface F { ys: number[] }
// inherited interface members resolve through the extends chain
interface SubI extends F { tag: string }
function isSub(o: unknown): o is SubI { return true; }
function gi(v: unknown) {
  if (isSub(v)) {
    v.ys.at(0);
    v.ys.toSorted();
  }
}
