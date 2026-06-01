import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// indexed access on a parenthesised intersection objectType (`(A & B)['items']`): the paren
// wrapper is peeled before intersection member collection so the array value type resolves and
// the array-specific at variant is selected
interface A {
  items: number[];
}
interface B {
  other: string;
}
declare const x: (A & B)['items'];
const r = _atMaybeArray(x).call(x, 0);
export { r };