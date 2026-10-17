import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
use(function (_ref, Symbol, _unused = void 0) {
  let name = _nameMaybeFunction(_ref);
  return name;
}(_Symbol));