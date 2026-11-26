interface Predicates {
  isStr(x: unknown): x is string;
  isArr(x: unknown): x is number[];
}
interface Container {
  kit: Predicates;
}
function caller(state: Container, input: string | number[]) {
  if ((state as Container).kit?.isStr(input)) {
    input.padStart(4, '0');
    return input.at(0);
  }
}
caller(undefined as any, undefined as any);
