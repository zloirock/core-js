import "core-js/modules/es.string.repeat";
import "core-js/modules/es.array.at";
// User-defined type predicates invoked through an optional-call chain
// (`obj?.isStr(input)`, `obj?.isArr(input)`) must still narrow the argument
// inside the guarded branch. With `input: string | number[]`, the string branch
// uses `.repeat(2)` and should emit only `es.string.repeat`; the array branch
// uses `.at(-1)` and should emit only `es.array.at`. Distinct methods per branch
// pin which guard succeeded. Same narrowing must hold whether the predicate is
// invoked through `obj.isX(...)` or `obj?.isX(...)`.
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