import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref, _ref2;
// @flow
// A callable reached through an indexed access (`declare var f: D['fn']`). Flow keeps a member's
// signature on the property's `value`, so the member lookup hands back the FunctionTypeAnnotation
// itself where TS hands back a method signature - peeling that to its return type gave the caller
// the RESULT where it expected the SIGNATURE, and its own return read then found nothing.
// Distinct methods per arm: Array -> es.array.at, string -> es.string.includes.
type D = {
  rows(): Array<number>,
  label(): string,
};
declare var readRows: D['rows'];
declare var readLabel: D['label'];
_atMaybeArray(_ref = readRows()).call(_ref, 0);
_includesMaybeString(_ref2 = readLabel()).call(_ref2, 'x');