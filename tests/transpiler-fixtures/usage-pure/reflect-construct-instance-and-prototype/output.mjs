import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _at from "@core-js/pure/actual/instance/at";
import _Reflect$construct from "@core-js/pure/actual/reflect/construct";
var _ref, _ref2;
class Target {
  item = [7];
}
class NewTarget {
  get item() {
    return "text";
  }
}
class Methods {
  item() {
    return "target";
  }
}
class Other {
  item() {
    return [9];
  }
}
export const field = _at(_ref = _Reflect$construct(Target, [], NewTarget).item).call(_ref, 0);
export const method = _atMaybeArray(_ref2 = _Reflect$construct(Methods, ...[[], Other]).item()).call(_ref2, 0);