// Keep disabled source slots native while independent live claims remain eligible.
export let r;
export const effects = [];
const nativeResolve = Function("return Promise.resolve")();
// core-js-disable-next-line
r = (({
  resolve
}) => resolve)(Promise // core-js-disable-line
) === nativeResolve;