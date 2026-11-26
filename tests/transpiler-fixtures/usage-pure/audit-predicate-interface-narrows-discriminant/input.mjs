// a UNION target composes with a discriminant guard on the result
type W = { kind: 'a', xs: number[] } | { kind: 'b', xs: string };
function isW(o: unknown): o is W { return true; }
function gw(v: unknown) {
  if (isW(v) && v.kind === 'a') {
    v.xs.at(0);
    v.xs.fill(0);
  }
}
