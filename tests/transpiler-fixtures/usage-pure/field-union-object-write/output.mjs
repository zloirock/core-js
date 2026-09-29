import _includes from "@core-js/pure/actual/instance/includes";
var _ref;
// Writes to one field retain both receiver families.
// Pure keeps generic dispatch; the precise family set is observed by the global twin.
const box = {
  data: [10, 20]
};
box.data = "1020";
export const result = _includes(_ref = box.data).call(_ref, "02");