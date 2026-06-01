import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// indexed access on a parenthesised union objectType (`(A | B)['items']`): the leading
// paren wrapper is peeled before union dispatch so both branches' array element type
// propagate and the array-specific at variant is selected
type A = { items: number[] };
type B = { items: string[] };
declare const x: (A | B)['items'];
const r = _atMaybeArray(x).call(x, 0);
export { r };