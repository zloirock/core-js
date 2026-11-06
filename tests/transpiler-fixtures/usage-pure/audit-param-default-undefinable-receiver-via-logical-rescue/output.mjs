import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// The logical left keeps its nullish branch so the rescue still runs when the host is absent.
export function viaLogicalRescue({
  of
} = (null == _globalThis.window ? void 0 : {
  of: _Array$of
}) ?? {}) {
  return of;
}