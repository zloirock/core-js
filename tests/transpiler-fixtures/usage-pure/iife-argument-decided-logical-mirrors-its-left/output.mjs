import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// An IIFE argument whose `||` / `??` the build decides for its left is that left: the mirror replaces it.
export const viaOr = (({
  from
}) => from)({
  from: _Array$from
});
export const viaNullish = (({
  of
}) => of)({
  of: _Array$of
});