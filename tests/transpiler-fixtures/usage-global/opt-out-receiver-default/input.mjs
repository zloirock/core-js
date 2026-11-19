// Keep disabled source slots native while independent live claims remain eligible.
export let r;
export const effects = [];
const nativeResolve = Function("return Promise.resolve")();
function pick({ resolve } =
Promise // core-js-disable-line
) { return resolve; }
r = pick() === nativeResolve;
