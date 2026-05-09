// arrow-fn class field rewrites `this.box` after init - dispatch must widen
// from array-narrow to generic since runtime field type diverges from init
class C {
  box = [1, 2, 3];
  reset = () => { this.box = "x"; };
  first() { return this.box.at(0); }
}
const c = new C();
c.reset();
c.first();
