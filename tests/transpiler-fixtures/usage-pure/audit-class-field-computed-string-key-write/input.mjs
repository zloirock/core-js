// computed-key write `c['box'] = "x"` on instance is semantically identical to dot
// access (`c.box = "x"`) - dispatch must widen exactly the same way
class C {
  box = [1, 2, 3];
  first() { return this.box.at(0); }
}
const c = new C();
c['box'] = "x";
c.first();
