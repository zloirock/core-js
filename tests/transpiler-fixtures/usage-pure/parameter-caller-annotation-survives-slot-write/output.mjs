import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// Caller annotations survive legal same-slot writes.
// Nested and flat parameter reads use the caller field's declared receiver family.

const stringBox: {
  value: string;
} = {
  value: 'ab'
};
stringBox.value = 'cd';
type StringFieldOracle = typeof stringBox.value;
const stringFieldOracle: StringFieldOracle = 'ef';
function readString(_ref, _unused = void 0) {
  var _ref2;
  let at = _atMaybeString((_ref2 = _ref.value) === void 0 ? 'gh' : _ref2);
  return at;
}
export const stringResult = readString(stringBox);
const arrayBox: {
  value: number[];
} = {
  value: [1]
};
arrayBox.value = [2];
type ArrayFieldOracle = typeof arrayBox.value;
const arrayFieldOracle: ArrayFieldOracle = [3];
function readArray(_ref3, _unused2 = void 0) {
  let includes = _includesMaybeArray(_ref3.value);
  return includes;
}
export const arrayResult = readArray(arrayBox);
function readFlat(_ref4, _unused3 = void 0) {
  let flat = _flatMaybeArray(_ref4);
  return flat;
}
export const flatResult = readFlat(arrayBox.value);