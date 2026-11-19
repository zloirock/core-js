// Keep disabled source slots native while independent live claims remain eligible.
export let r;
export const effects = [];
const nativeResolve = Function("return Promise.resolve")();
const flag = true; const { Promise: { resolve } } = flag ?
globalThis // core-js-disable-line
: self; r = resolve === nativeResolve;
