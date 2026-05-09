import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// class binding without leak channels - all refs are member-receiver / new / extends /
// instanceof / TS type-position - closure walk succeeds and static-field flow narrows to
// init type. positive lock that the narrowing path still fires when no opaque mutation
// channel exists (companion to audit-class-static-field-fn-arg-leak which exercises bail)
class C {
  static items = [1, 2, 3];
  static getFirst() {
    var _ref;
    return _atMaybeArray(_ref = C.items).call(_ref, 0);
  }
}
class Sub extends C {}
new C() instanceof C;
C.getFirst();