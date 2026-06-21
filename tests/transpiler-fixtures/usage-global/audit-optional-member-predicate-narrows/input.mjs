// user-defined type predicates invoked through an optional-call chain (`obj?.isStr(input)`,
// `obj?.isArr(input)`) must still narrow the argument inside the guarded branch. with
// `input: string | number[]`, the string branch's `.repeat(2)` emits only es.string.repeat
// and the array branch's `.at(-1)` only es.array.at - same narrowing as the non-optional call.
interface Predicates {
  isStr(x: unknown): x is string;
  isArr(x: unknown): x is number[];
}
function caller(obj: Predicates, input: string | number[]) {
  if (obj?.isStr(input)) {
    input.repeat(2);
  }
  if (obj?.isArr(input)) {
    input.at(-1);
  }
}
caller(undefined as any, undefined as any);
