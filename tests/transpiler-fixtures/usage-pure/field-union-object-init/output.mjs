import _includes from "@core-js/pure/actual/instance/includes";
var _ref;
// A mixed initializer retains its finite receiver union.
// Pure keeps generic dispatch; the precise family set is observed by the global twin.
const box = {
  data: flag ? [10, 20] : "1020"
};
export const result = _includes(_ref = box.data).call(_ref, "02");