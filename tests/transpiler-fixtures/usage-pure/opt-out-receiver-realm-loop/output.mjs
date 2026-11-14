// Keep disabled source slots native while independent live claims remain eligible.
export let r;
export const effects = [];
const nativeResolve = Function("return Promise.resolve")();
// core-js-disable-next-line
for (const {
  Promise: {
    resolve
  }
} of [globalThis // core-js-disable-line
]) {
  r = resolve === nativeResolve;
}