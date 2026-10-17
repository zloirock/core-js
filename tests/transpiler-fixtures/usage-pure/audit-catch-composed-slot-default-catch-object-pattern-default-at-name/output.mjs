import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _at from "@core-js/pure/actual/instance/at";
try {
  risky();
} catch (_ref) {
  let _ref2;
  let viaCatch = _nameMaybeFunction((_ref2 = _at(_ref)) === void 0 ? {} : _ref2);
  use(viaCatch);
}