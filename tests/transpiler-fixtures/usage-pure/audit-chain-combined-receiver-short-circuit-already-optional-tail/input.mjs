// an ALREADY-optional method access keeps its single `?.` - the short-circuit rewrite must
// not double it
export function alreadyOptionalTail(o) {
  return o?.b.c?.notPolyfilled?.().map(x => x).length;
}
