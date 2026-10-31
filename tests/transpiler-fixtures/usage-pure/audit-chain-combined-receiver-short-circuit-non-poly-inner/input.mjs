// the same link rule on the NON-polyfilled inner path: the link is tested and the method is
// read plainly off the receiver memo, so a nullish receiver throws there as the source does
export function nonPolyInner(o) {
  return o?.b.c.notPolyfilled?.().map(x => x).length;
}
