import _at from "@core-js/pure/actual/instance/at";
import _keys from "@core-js/pure/actual/instance/keys";
// Private array captures keep their position between public sibling initializers.
declare const eff: () => any;
declare const pick: () => any;
export namespace N {
  export const q = eff();
  const _ref = pick();
  export const at = _at(_ref);
  export const keys = _keys(_ref);
}