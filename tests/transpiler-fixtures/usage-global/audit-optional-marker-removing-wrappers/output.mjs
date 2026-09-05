import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
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
(viaRequired ?? 'fallback').at(0);
(nonNullable ?? 'fallback').includes(1);