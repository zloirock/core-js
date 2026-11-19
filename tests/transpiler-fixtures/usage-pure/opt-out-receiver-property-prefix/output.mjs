import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// Keep disabled source slots native while independent live claims remain eligible.
export let r;
export const effects = [];
const nativeResolve = Function("return Promise.resolve")();
// core-js-disable-next-line
Function("return 1")();
const resolve = _Promise$resolve;
r = typeof resolve;