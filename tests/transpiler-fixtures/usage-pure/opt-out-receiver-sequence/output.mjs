import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// Keep disabled source slots native while independent live claims remain eligible.
export let r;
export const effects = [];
const nativeResolve = Function("return Promise.resolve")();
// core-js-disable-next-line
const {
  resolve
} = (_pushMaybeArray(effects).call(effects, "prefix"), Promise // core-js-disable-line
);
r = resolve === nativeResolve;