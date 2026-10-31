import _Math$trunc from "@core-js/pure/actual/math/trunc";
// DEFINED navs keep the plain anchored collapses - no guard, no probe
export const {
  Math: {
    trunc: viaDefinedAnchoredTrunc
  }
} = {
  Math: {
    trunc: _Math$trunc
  }
};