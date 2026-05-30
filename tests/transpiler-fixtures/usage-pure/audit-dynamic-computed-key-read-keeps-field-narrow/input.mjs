// negative: a dynamic computed-key member as a READ (array-literal element `[c[k]]` on the RHS,
// destructured into `x`) is a member access, not a write - the instance does not escape through a
// mutation channel, so the field narrow `this.box -> Array` is kept and `.at` stays the array-only
// helper. confirms the write-detection is target-position-specific, not "any dynamic member"
class C {
  box = [1, 2, 3];
  first() {
    return this.box.at(0);
  }
}
declare const k: string;
const c = new C();
const [x] = [c[k]];
c.first();
void x;
