// Keep disabled source slots native while independent live claims remain eligible.
export let r;
export const effects = [];
const nativeResolve = Function("return Promise.resolve")();
const flag = true;
// core-js-disable-next-line
const {
  resolve
} = flag ? Promise // core-js-disable-line
: Object;
r = resolve === nativeResolve;