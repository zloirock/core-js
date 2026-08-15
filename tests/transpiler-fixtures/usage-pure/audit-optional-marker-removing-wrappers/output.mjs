import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref, _ref2;
// the mirror direction: `Required<>` and `NonNullable<>` REMOVE optionality, so the reads
// below really are always-present and must narrow to the array family alone - a marker contract
// that only ever adds the flag would leave them generic
interface I {
  items?: number[];
  tags?: number[];
}
declare const required: Required<I>;
declare const nonNullable: NonNullable<I['tags']>;
const viaRequired = required.items;
_atMaybeArray(_ref = viaRequired ?? 'fallback').call(_ref, 0);
_includesMaybeArray(_ref2 = nonNullable ?? 'fallback').call(_ref2, 1);