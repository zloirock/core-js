// compound assignments (`+=`, `-=`, `||=`, ...) are skipped by the flow scan: RHS type
// doesn't reflect the final stored value for compound forms. init `[]` drives the type
// unchallenged, `.at(0)` picks the array variant
class C {
  #tag = [];
  bump(s) { this.#tag += s; }
  first() { return this.#tag.at(0); }
}
