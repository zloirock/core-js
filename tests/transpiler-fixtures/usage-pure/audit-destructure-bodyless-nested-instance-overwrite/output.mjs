import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// a nested-instance assignment in a BODYLESS control body (`if (cond) [{ flat }] = [a];`): the
// polyfill overwrite (`flat = _flatMaybeArray(a)`) has to stay CONDITIONAL - emitted after the
// bodyless statement it would run unconditionally, a value change. the consumed slot leaves here
// exactly as it leaves a statement-position host, and the dispatch then takes the slot itself:
// one statement in, one out, so no block is owed. two statements would take one
declare const a: number[];
let flat;
if (cond) flat = _flatMaybeArray(a);
export { flat };