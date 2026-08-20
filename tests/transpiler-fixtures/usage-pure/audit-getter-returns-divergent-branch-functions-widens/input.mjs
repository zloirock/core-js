// `c.f()` invokes the function the getter returns. The getter returns DIFFERENT functions on its
// two branches - one returning `number[]`, one returning `string` - which are type-equal as bare
// functions but differ on invoke. Folding every branch's invoke-return yields no common type, so
// `.at` gets the generic polyfill instead of narrowing to the first branch's array.
declare const cond: boolean;
class C {
  get f() {
    if (cond) return () => [1, 2, 3];
    return () => "string";
  }
}
const c = new C();
c.f().at(0);
