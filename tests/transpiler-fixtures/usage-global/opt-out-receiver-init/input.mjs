// Keep disabled source slots native while independent live claims remain eligible.
export let r;
export const effects = [];
const nativeResolve = Function("return Promise.resolve")();
const { resolve } =
Promise; // core-js-disable-line
r = resolve === nativeResolve;
