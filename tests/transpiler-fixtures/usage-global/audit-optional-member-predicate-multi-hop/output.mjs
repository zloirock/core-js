import "core-js/modules/es.array.at";
interface Predicates {
  isStr(x: unknown): x is string;
  isArr(x: unknown): x is number[];
}
interface Container {
  kit: Predicates;
}
function caller(state: Container, input: string | number[]) {
  if (state?.kit.isArr(input)) return input.at(-1);
}
caller(undefined as any, undefined as any);