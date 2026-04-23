import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// explicit type annotation on a public field bypasses the "externally writable -> unknown"
// fallback. the annotation is authoritative: caller opted into the contract, so narrowing
// `.at(-1)` to `_atMaybeArray` is sound
class C {
  items: number[] = [];
  first() {
    var _ref;
    return _atMaybeArray(_ref = this.items).call(_ref, -1);
  }
}