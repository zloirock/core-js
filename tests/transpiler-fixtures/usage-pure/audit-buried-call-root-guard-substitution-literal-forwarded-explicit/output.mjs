import _Array$of from "@core-js/pure/actual/array/of";
const forwardsExplicit = () => ({
  window: {
    Array: Array
  }
});
export const literalForwardedExplicit = null == forwardsExplicit() ? void 0 : _Array$of(14);