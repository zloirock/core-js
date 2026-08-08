// mixin pattern `class Sub extends mix(Base)` - subclass writes `this.box` reach
// Base's instance flow, dispatch on Base's `this.box.at(0)` must widen to generic
function mix(B) { return B; }
class Base {
  box = [1, 2, 3];
  first() { return this.box.at(0); }
}
class Sub extends mix(Base) {
  set() { this.box = "x"; }
}
const b = new Base();
const s = new Sub();
s.set();
b.first();
