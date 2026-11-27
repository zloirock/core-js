import _includes from "@core-js/pure/actual/instance/includes";
import _Reflect$set from "@core-js/pure/actual/reflect/set";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref, _ref2;
namespace App {
  export enum State {
    Ready
  }
}
const {
  State: saved
} = App;
export const before = _atMaybeString(_ref = App.State[0]).call(_ref, 0);
if (flag) _Reflect$set(saved, 0, ['written']);
export const after = _includes(_ref2 = App.State[0]).call(_ref2, 'written');