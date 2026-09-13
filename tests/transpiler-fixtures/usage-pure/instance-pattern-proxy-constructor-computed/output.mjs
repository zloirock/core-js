import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
// A constant computed constructor key through a realm alias names the same receiver
// as a dotted global read, so its destructured instance slot gets the same helper.
const realm = _globalThis;
export const value = (({
  name
}) => name)({
  name: _nameMaybeFunction(_Symbol)
});