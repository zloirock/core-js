import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// `Record<number, string[]>` indexed by a numeric literal must still resolve the value type.
// The synthesised index signature lacks an explicit key annotation, so resolution must fall through
// the string-key path without losing the `string[]` value shape.
type NumericRecord = Record<number, string[]>;
declare const r: NumericRecord;
_atMaybeArray(_ref = r[5]).call(_ref, 0);