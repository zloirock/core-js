import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// compound assignments (`+=`, `-=`, `||=`, ...) are skipped by the flow scan: RHS type
// doesn't reflect the final stored value for compound forms. init `[]` drives the type
// unchallenged, `.at(0)` picks the array variant
class C {
  #tag = [];
  bump(s) {
    this.#tag += s;
  }
  first() {
    var _ref;
    return _atMaybeArray(_ref = this.#tag).call(_ref, 0);
  }
}