import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
export function read(receiver) {
  try {
    const [, _ref] = [receiver, later];
    const flat = _flatMaybeArray(receiver);
    const last = _ref === void 0 ? flat() : _ref;
    const later = 1;
    return [flat, last, later];
  } catch (error) {
    return _nameMaybeFunction(error);
  }
}