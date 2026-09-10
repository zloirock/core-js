// a discriminant-narrowed read inside an instance field initializer observes the field write and
// the identity reassignment that textually follow the class: both run before `new K()` evaluates
// the initializer, so the narrow drops: the `at` row injects both reachable families, the `includes`
// row a third the declared union cannot reach
type A = { kind: 'a'; v: string };
type B = { kind: 'b'; v: number[] };
declare function anyv(): any;
export function fieldWrite(o: A | B) {
  if (o.kind === 'a') {
    class K { p = o.v.at(0); }
    o.kind = 'b';
    o.v = [1, 2];
    return new K();
  }
  return null;
}
export function identityWrite(o: A | B) {
  if (o.kind === 'a') {
    class K { p = o.v.includes('x'); }
    o = anyv();
    return new K();
  }
  return null;
}
