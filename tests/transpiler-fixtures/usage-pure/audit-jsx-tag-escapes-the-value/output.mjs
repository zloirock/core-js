import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6;
// A JSX tag names its binding to a renderer, which may do anything with the value - so the tag is an
// ESCAPE, and every narrow that rests on enumerating the binding's references has to drop. Three of
// them do: an array's ELEMENT type, an object literal's alias closure, and a member-path discriminant.
// Each row keeps the same receiver shape as its control below, so the only difference is the tag.
const elementRetype = [['a']];
export const viaElement = _at(_ref = elementRetype[0]).call(_ref, 0);
const aliasClosure = {
  xs: ['a']
};
export const viaAlias = _at(_ref2 = aliasClosure.xs).call(_ref2, 0);
const memberPath = {
  kind: 'a',
  xs: ['a']
};
export const viaMemberPath = _at(_ref3 = memberPath.xs).call(_ref3, 0);
export const tags = [<elementRetype.Sub x={1} />, <aliasClosure.Sub x={2} />, <memberPath.Sub x={3} />];

// CONTROL: the same three shapes with no tag naming them keep the array-specific narrow, so the file
// shows the narrow being dropped rather than a resolver that never narrowed at all.
const cleanElement = [['a']];
const cleanAlias = {
  xs: ['a']
};
const cleanMemberPath = {
  kind: 'a',
  xs: ['a']
};
export const clean = [_atMaybeArray(_ref4 = cleanElement[0]).call(_ref4, 0), _atMaybeArray(_ref5 = cleanAlias.xs).call(_ref5, 0), _atMaybeArray(_ref6 = cleanMemberPath.xs).call(_ref6, 0)];