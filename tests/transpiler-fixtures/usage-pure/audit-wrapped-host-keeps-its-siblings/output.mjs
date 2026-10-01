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
const [_ref] = [nested],
  {
    lead
  } = _ref,
  {
    y: _ref2
  } = _ref,
  flat = _flatMaybeArray(_ref2),
  {
    extra
  } = _ref2,
  {
    top
  } = _ref;
// A following sibling retains its native read after the captured nested properties.
const [_ref3] = [nested];
const {
  y: _ref4
} = _ref3;
const flatA = _flatMaybeArray(_ref4);
const {
  extra: extraA
} = _ref4;
const {
  top: topA
} = _ref3;
// A preceding sibling reads before the nested hop.
const [_ref5] = [nested],
  {
    lead: leadB
  } = _ref5,
  {
    y: _ref6
  } = _ref5,
  flatB = _flatMaybeArray(_ref6),
  {
    extra: extraB
  } = _ref6;
// ... and the SOLE-hop host still normalizes: the element takes the nav, the pattern the leaf
const _ref7 = nested.y;
const flatSole = _flatMaybeArray(_ref7);
const [{
  extra: extraSole
}] = [_ref7];
export { lead, flat, extra, top, flatA, extraA, topA, leadB, flatB, extraB, flatSole, extraSole };