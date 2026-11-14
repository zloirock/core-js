import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Promise from "@core-js/pure/actual/promise";
// Keep disabled source slots native while independent live claims remain eligible.
export let r;
export const effects = [];
const nativeResolve = Function("return Promise.resolve")();
const out = [];
// core-js-disable-next-line
for (const {
  resolve
} of [Promise, // core-js-disable-line
_Promise]) {
  _pushMaybeArray(out).call(out, resolve === nativeResolve);
}
r = [out[0], out.length];