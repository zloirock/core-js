// module-wide scan catches external writes like `c.box = "str"`. receiver statically
// resolves to an instance of C, so the write joins the flow fold. union of Array|string
// collapses, `.at(0)` falls back to generic `_at`
class C {
  box = [1, 2, 3];
  first() { return this.box.at(0); }
}
const c = new C();
c.box = "hello";
