import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref, _ref2;
// an assignment whose value stores a selection the build decides reads the operand of it that runs: a nested
// instance leaf dispatches on that operand's type, behind an effect prefix or not, and the store keeps the operand
const o = {};
let at, atBare;
({
  C: _ref
} = (eff(), o.s = {
  C: []
}));
at = _atMaybeArray(_ref);
({
  C: _ref2
} = o.t = {
  C: []
});
atBare = _atMaybeArray(_ref2);
export { at, atBare };