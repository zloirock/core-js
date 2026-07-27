import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref, _ref2;
// calling a getter is two steps: read the property, then invoke what it returned. for a getter with
// a body the resolver already does both; a DECLARED getter carries only its return annotation, and
// reading that as a method return type answers with the function itself, which suppresses the
// polyfill on the call result. both spellings of a bodyless getter are here because the parsers
// model them differently. distinct method per row
declare class Declared {
  get a(): () => number[];
  get b(): () => string;
}
declare const d: Declared;
_includesMaybeArray(_ref = d.a()).call(_ref, 1);
_atMaybeString(_ref2 = d.b()).call(_ref2, 0);