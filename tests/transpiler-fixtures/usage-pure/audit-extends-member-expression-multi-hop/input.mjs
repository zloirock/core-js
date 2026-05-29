// `class Sub extends NS.Inner.Base` - the extends base is a multi-hop member expression
// resolved through a const-bound object. Sub must be recognized as a Base subclass so that
// the external write `s.box = "..."` (which changes the field away from array) bails the
// field narrow: inherited Base.box falls back to the generic `at`, not the Array-only one.
class Base {
  box = [1, 2, 3];
  first() { return this.box.at(0); }
}
const NS = { Inner: { Base } };
class Sub extends NS.Inner.Base {}
const s = new Sub();
s.box = "stringified";
s.first();
