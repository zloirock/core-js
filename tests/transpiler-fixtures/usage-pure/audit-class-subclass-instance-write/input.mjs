// subclass instance external write (`s.box = "..."`) affects the inherited Base.box field
// slot. base instance closure now includes `new Sub()` bindings via the descendant-name
// transitive walk (subclassesBySuper); without it the write would only match `new Base()`
// instance bindings (none exist) and stay unsound, leaving the inherited-field narrow at
// `_atMaybeArray` while runtime gets a string
class Base {
  box = [1, 2, 3];
  first() { return this.box.at(0); }
}
class Sub extends Base {}
const s = new Sub();
s.box = "stringified";
s.first();
