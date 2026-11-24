import _at from "@core-js/pure/actual/instance/at";
import _keys from "@core-js/pure/actual/instance/keys";
// Private array captures keep their position between public sibling initializers.
declare const eff: () => any;
declare const pick: () => any;
export namespace N {
  let _ref;
  export const q = eff(),
    at = (_ref = pick(), _at(_ref)),
    {
      keys: keys
    } = {
      keys: _keys(_ref)
    };
}