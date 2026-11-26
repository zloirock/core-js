interface Predicates {
  isStr(x: unknown): boolean;
  isArr(x: unknown): x is number[];
}
interface Container {
  kit: Predicates;
}
function caller(state: Container, input: string | number[]) {
  if (state.kit?.isStr(input)) return input.at(0);
}
