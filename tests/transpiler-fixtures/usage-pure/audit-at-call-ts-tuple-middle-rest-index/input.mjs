// Tuple with a middle rest `[number, ...string[], boolean]` indexed at position 2:
// the slot could be either `string` (rest holds 2+ elements) or `boolean` (rest empty),
// so the type is ambiguous and `m[2].at(0)` emits the generic instance polyfill.
type Mixed = [number, ...string[], boolean];
declare const m: Mixed;
m[2].at(0);
