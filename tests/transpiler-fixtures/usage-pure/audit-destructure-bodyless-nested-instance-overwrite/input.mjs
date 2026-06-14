// a nested-instance assignment in a BODYLESS control body (`if (cond) [{ flat }] = [a];`): the
// polyfill overwrite (`flat = _flatMaybeArray(a)`) must join the destructure inside a `{ }` block so it
// stays conditional - appended after the bodyless statement it would run unconditionally (value change)
declare const a: number[];
let flat;
if (cond) [{ flat }] = [a];
export { flat };
