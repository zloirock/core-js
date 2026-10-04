import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _Object$assign from "@core-js/pure/actual/object/assign";
// Native captures preserve the bindings beside a nested hop.
// Each nested property is read once; stable source names need no capture.
const nested = {
  lead: 5,
  y: _Object$assign([1, [2]], {
    extra: 7
  }),
  top: 4
};
// Siblings on both sides keep their reads around the nested hop.
const [,] = [nested],
  {
    lead
  } = nested,
  {
    y: _ref
  } = nested,
  flat = _flatMaybeArray(_ref),
  {
    extra
  } = _ref,
  {
    top
  } = nested;
// A following sibling retains its native read after the captured nested properties.
const [,] = [nested];
const {
  y: _ref2
} = nested;
const flatA = _flatMaybeArray(_ref2);
const {
  extra: extraA
} = _ref2;
const {
  top: topA
} = nested;
// A preceding sibling reads before the nested hop.
const [,] = [nested],
  {
    lead: leadB
  } = nested,
  {
    y: _ref3
  } = nested,
  flatB = _flatMaybeArray(_ref3),
  {
    extra: extraB
  } = _ref3;
// ... and the SOLE-hop host still normalizes: the element takes the nav, the pattern the leaf
const _ref4 = nested.y;
const flatSole = _flatMaybeArray(_ref4);
const [{
  extra: extraSole
}] = [_ref4];
export { lead, flat, extra, top, flatA, extraA, topA, leadB, flatB, extraB, flatSole, extraSole };