// Keep disabled source slots native while independent live claims remain eligible.
export let r;
export const effects = [];
const nativeResolve = Function("return Promise.resolve")();
function pick({ resolve }) { return resolve; }
r = pick(Promise) === nativeResolve; // core-js-disable-line
