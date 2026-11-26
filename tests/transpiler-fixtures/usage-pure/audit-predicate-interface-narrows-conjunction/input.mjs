interface F { ys: number[] }
interface SubI extends F { tag: string }
function isSub(o: unknown): o is SubI { return true; }
// composes with an && chain
function ga(v: unknown) {
  if (isSub(v) && v.tag) {
    v.ys.at(0);
    v.ys.with(0, 2);
  }
}
