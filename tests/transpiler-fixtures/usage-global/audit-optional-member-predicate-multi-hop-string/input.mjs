interface Predicates {
  isStr(x: unknown): x is string;
  isArr(x: unknown): x is number[];
}
interface Container {
  kit: Predicates;
}
function caller(state: Container, input: string | number[]) {
  if (state.kit?.isStr(input)) {
    input.repeat(2);
    return input.at(0);
  }
}
caller(undefined as any, undefined as any);
