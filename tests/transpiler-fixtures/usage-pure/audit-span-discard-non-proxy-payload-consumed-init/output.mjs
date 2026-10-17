import _Array$of from "@core-js/pure/actual/array/of";
// a fully-consumed destructure drops its init WHOLE, and the sequence prefix sits under the member
// spine where the top-level peel never reaches it
export const consumedInit = (() => {
  const of = _Array$of;
  return typeof of;
})();