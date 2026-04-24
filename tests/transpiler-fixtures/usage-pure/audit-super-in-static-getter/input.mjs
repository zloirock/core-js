// `super.X` inside a static *getter* - getters count as ClassMethods and `m.static` is
// true, so `findEnclosingClassMember` yields `isStatic: true`. The super.X call inside
// should polyfill. Plugin should NOT treat the getter body differently from a method body.
class C extends Promise {
  static get helper() {
    return super.allSettled([]);
  }
  static set setter(x) {
    super.resolve(x);
  }
}
