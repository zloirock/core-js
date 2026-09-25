import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _entries from "@core-js/pure/actual/instance/entries";
import _values from "@core-js/pure/actual/instance/values";
import _String$fromCodePoint from "@core-js/pure/actual/string/from-code-point";
var _ref, _ref2, _ref3, _ref4, _ref5;
// a NAMESAKE of a local callee bound in another scope - a parameter of some other function, a local
// of another body - is no read of the callee: its caller set stays closed, the argument pairs with the
// parameter and the returned slot's static read takes the runtime identity guard against it. the
// escaping callback literal is what the escape census classifies before the container census runs.
// constructors only: an unknown index keeps a NAMESPACE's whole family (no constructor selection)
export const escaping = {
  of: () => other
};
const key = [0].pop();
function relabel(box1) {
  return box1;
}
function box1(value) {
  return [value];
}
export const viaParam = (_ref = box1(Array)[key], _ref === Array ? _Array$from([1]) : _ref.from([1]));
function relabelDefault(box2 = 1) {
  return box2;
}
function box2(value) {
  return [value];
}
export const viaDefaultedParam = _entries(_ref2 = box2(Object)[key]).call(_ref2, {});
function relabelPattern({
  box3
}) {
  return box3;
}
function box3(value) {
  return [value];
}
export const viaPatternParam = (_ref3 = box3(Array)[key], _ref3 === Array ? _Array$of(1) : _ref3.of(1));
const relabelArrow = box4 => box4;
function box4(value) {
  return [value];
}
export const viaArrowParam = box4(String)[key].raw`x`;
const relabelling = {
  relabel(box5) {
    return box5;
  }
};
function box5(value) {
  return [value];
}
export const viaMethodParam = (_ref4 = box5(String)[key], _ref4 === String ? _String$fromCodePoint(65) : _ref4.fromCodePoint(65));
function elsewhere() {
  const box6 = 1;
  return box6;
}
function box6(value) {
  return [value];
}
export const viaForeignLocal = _values(_ref5 = box6(Object)[key]).call(_ref5, {});