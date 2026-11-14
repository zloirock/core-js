// Keep disabled source slots native while independent live claims remain eligible.
export let r;
export const effects = [];
const nativeResolve = Function("return Promise.resolve")();
const { resolve } = (
Function("return 1")(), // core-js-disable-line
Promise); r = typeof resolve;
