// a computed member key evaluates in the OUTER `this`, even inside a skipped this-rebinding
// subtree (a babel ObjectMethod, a nested class member). the `this.a = ...` / `this.b = ...` writes
// buried in those keys must still widen the fields -> generic `_at` / `_includes` for both (the
// methods exist on the foreign string value too), not array-specific Maybe variants
class C {
  a = [1];
  b = [2];
  m() {
    const o = { [this.a = "s"]() {} };
    class D { [this.b = "s"]() {} }
    return [this.a.at(0), this.b.includes(2)];
  }
}
