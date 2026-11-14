// Keep disabled source slots native while independent live claims remain eligible.
export let r;
export const effects = [];
const nativeResolve = Function("return Promise.resolve")();
const out = []; for (const { resolve } of [
Promise, // core-js-disable-line
Promise
]) { out.push(resolve === nativeResolve); } r = [out[0], out.length];
