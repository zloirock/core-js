import _globalThis from "@core-js/pure/actual/global-this";
import _trimStartMaybeString from "@core-js/pure/actual/string/instance/trim-start";
var _ref;
// `typeof` always yields a string - the member narrows and the string method polyfills
enum E4 {
  T = typeof _globalThis
}
use(_trimStartMaybeString(_ref = E4.T).call(_ref));