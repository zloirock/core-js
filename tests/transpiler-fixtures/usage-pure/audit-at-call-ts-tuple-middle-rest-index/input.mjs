// Tuple with a middle rest `[number, ...string[], boolean]` indexed at position 2:
// the slot is `string` with 2+ rest elements, `boolean` with one, or absent with none,
// so the type is ambiguous and `m[2].at(0)` emits the generic instance polyfill.
type Mixed = [number, ...string[], boolean];
declare const m: Mixed;
m[2].at(0);
