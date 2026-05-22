import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// HKT apply through Promise: `Wrap<F, X> = F<X>` with F=Promise, X=number[].
// without applyHigherKindedArgs the bound F (`Promise` with inner=null) drops the
// type-arg and the awaited unwrap can't recover the array element. with the apply,
// `await p` resolves to `Array<number>` and `.at(0)` narrows on the array surface
type Wrap<F, X> = F<X>;
declare const p: Wrap<Promise, number[]>;
async function f() {
  var _ref;
  _atMaybeArray(_ref = await p).call(_ref, 0);
}