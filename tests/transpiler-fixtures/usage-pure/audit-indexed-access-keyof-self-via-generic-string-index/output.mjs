import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// An arbitrary keyof can reach a symbol property outside the string index signature.
function f<T extends {
  [key: string]: string[];
}>(t: T, k: keyof T) {
  var _ref;
  return _at(_ref = t[k]).call(_ref, 0);
}
function g<T extends Record<string, string>>(t: T, k: keyof T) {
  var _ref2;
  return _includes(_ref2 = t[k]).call(_ref2, 'a');
}
function bounded<T extends Record<PropertyKey, string>>(t: T, k: keyof T) {
  var _ref3;
  return _includesMaybeString(_ref3 = t[k]).call(_ref3, 'a');
}