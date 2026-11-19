import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// Keep disabled source slots native while independent live claims remain eligible.
export let r;
export const effects = [];
const nativeResolve = Function("return Promise.resolve")();
const flag = true;
// core-js-disable-next-line
const {
  Promise: {
    resolve
  }
} = flag ? globalThis // core-js-disable-line
: {
  Promise: {
    resolve: _Promise$resolve
  }
};
r = resolve === nativeResolve;