import _at from "@core-js/pure/actual/instance/at";
// The right-hand side of a DESTRUCTURING ASSIGNMENT runs before every slot of the pattern it fills,
// so the `o.f = 'str'` it carries is not ranked against the earlier `this.f.at(0)` by source
// position. A host lookup that only knew the declarator spelling would miss this one and keep the
// stale array narrow.
const o = {
  f: [1, 2],
  m() {
    var _ref;
    return _at(_ref = this.f).call(_ref, 0);
  }
};
o.m();
let q;
[q] = [o.f = 'str'];
export { q };