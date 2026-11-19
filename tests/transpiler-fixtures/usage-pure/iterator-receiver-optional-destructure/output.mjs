import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _self from "@core-js/pure/actual/self";
// Iterator keys preserve source guards, effects and receiver identity.
export function read(choice) {
  const effects = [];
  _globalThis.box = choice ? {
    list: [3]
  } : null;
  const at = _at(_self.box?.list ?? []);
  return at.call([3], 0);
}