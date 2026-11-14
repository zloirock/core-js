import _globalThis from "@core-js/pure/actual/global-this";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
// A wrapped optional callee uses the identity guard and retains caller-side this on the raw branch.
export function viaOptional(c) {
  let O;
  if (c) ({
    Object: O
  } = _globalThis);
  return O === Object ? _Object$groupBy([1, 2], x => x % 2) : O.groupBy?.([1, 2], x => x % 2);
}
export const r = [viaOptional(true)];