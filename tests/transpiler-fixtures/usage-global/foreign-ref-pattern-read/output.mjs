import "core-js/modules/es.array.at";
// An initless temporary does not prove a prior destructuring decision.
var _ref;
_ref = [3, 7];
const {
  at
} = _ref;
export const value = at.call(_ref, -1);