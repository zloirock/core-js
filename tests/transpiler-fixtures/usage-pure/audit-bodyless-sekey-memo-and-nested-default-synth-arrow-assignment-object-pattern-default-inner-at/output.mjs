import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
export const c3 = (() => {
  let at;
  ({
    inner: {
      at
    } = {
      at: _atMaybeArray([1, 2])
    }
  } = {});
  return typeof at;
})();
export const r = [c3];