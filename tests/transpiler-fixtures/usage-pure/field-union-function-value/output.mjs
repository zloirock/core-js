import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref;
// A callable initializer does not prove that later slot values remain functions.
// Pure keeps generic dispatch; the precise family set is observed by the global twin.
const box = {
  data: () => 1
};
box.data = "1020";
export const result = _includesMaybeString(_ref = box.data).call(_ref, "02");