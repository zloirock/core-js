import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// A supplied IIFE argument preserves the optional host guard before destructuring.
export const viaIifeArg = (({
  of
}) => of)(null == _globalThis.window ? void 0 : {
  of: _Array$of
});