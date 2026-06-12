// a user predicate narrowing to a STRUCTURAL target feeds member-chain resolution
interface F { ys: number[] }
function isF(o: unknown): o is F { return true; }
function gp(v: unknown) { if (isF(v)) v.ys.findLastIndex(x => !!x); }
// a method member of the target resolves its call return
interface M { make(): string }
function isM(o: unknown): o is M { return true; }
function gm(v: unknown) { if (isM(v)) v.make().padStart(2); }
// inherited interface members resolve through the extends chain
interface SubI extends F { tag: string }
function isSub(o: unknown): o is SubI { return true; }
function gi(v: unknown) { if (isSub(v)) v.ys.toSorted(); }
// composes with an && chain
function ga(v: unknown) { if (isSub(v) && v.tag) v.ys.with(0, 2); }
// a UNION target composes with a discriminant guard on the result
type W = { kind: 'a', xs: number[] } | { kind: 'b', xs: string };
function isW(o: unknown): o is W { return true; }
function gw(v: unknown) { if (isW(v) && v.kind === 'a') v.xs.fill(0); }
// a generic target substitutes its type arguments
interface Box<T> { val: T }
function isBox(o: unknown): o is Box<number[]> { return true; }
function gx(v: unknown) { if (isBox(v)) v.val.copyWithin(0, 1); }
// the ternary nullable fold composes with a predicate-narrowed receiver
function gt(v: unknown, c: boolean) { if (isBox(v)) (c ? v.val : null).entries(); }
