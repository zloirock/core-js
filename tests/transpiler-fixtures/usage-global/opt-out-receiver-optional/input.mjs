// Keep disabled source slots native while independent live claims remain eligible.
export let r;
export const effects = [];
const nativeResolve = Function("return Promise.resolve")();
r = (
// core-js-disable-next-line
globalThis
)?.Promise.resolve === nativeResolve;
