import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref;
// Enumerated writes preserve Function/String alternatives; only String includes is needed.
const box = {
  data() {}
};
const alias = flag ? {} : box;
alias.data = "1020";
export const result = _includesMaybeString(_ref = box.data).call(_ref, "02");