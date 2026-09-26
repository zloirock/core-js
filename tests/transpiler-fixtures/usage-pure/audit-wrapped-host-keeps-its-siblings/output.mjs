import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _Object$assign from "@core-js/pure/actual/object/assign";
// Native captures preserve the bindings beside a nested hop.
// A shared receiver is read once before its leaf properties; unsupported hosts stay native.
const nested = {
  lead: 5,
  y: _Object$assign([1, [2]], {
    extra: 7
  }),
  top: 4
};
// Siblings on both sides keep their reads around the nested hop.
const [_ref] = [nested];
const _ref2 = _ref;
const {
  lead
} = _ref2;
const _ref3 = _ref2.y;
const flat = _flatMaybeArray(_ref3);
const {
  extra
} = _ref3;
const {
  top
} = _ref2; // A following sibling retains its native read after the captured nested properties.
const [_ref4] = [nested];
const {
  y: _ref5
} = _ref4;
const flatA = _flatMaybeArray(_ref5);
const {
  extra: extraA
} = _ref5;
const {
  top: topA
} = _ref4;
// A preceding sibling reads before the nested hop.
const [_ref6] = [nested];
const _ref7 = _ref6;
const {
  lead: leadB
} = _ref7;
const _ref8 = _ref7.y;
const flatB = _flatMaybeArray(_ref8);
const {
  extra: extraB
} = _ref8; // ... and the SOLE-hop host still normalizes: the element takes the nav, the pattern the leaf
const _ref9 = nested.y;
const flatSole = _flatMaybeArray(_ref9);
const [{
  extra: extraSole
}] = [_ref9];
export { lead, flat, extra, top, flatA, extraA, topA, leadB, flatB, extraB, flatSole, extraSole };