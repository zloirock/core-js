// a getter winning a duplicate key is a DYNAMIC value: `NS.Base` is the getter (returns Object at
// runtime), so `super.allSettled` must NOT be substituted with the Promise pure helper - and both
// parsers must agree (babel skips the getter as ObjectMethod, oxc matches it as a Property)
const NS = { Base: Promise, get Base() { return Object; } };
class C extends NS.Base {
  static make() { return super.allSettled([]); }
}
export const c = C.make();
