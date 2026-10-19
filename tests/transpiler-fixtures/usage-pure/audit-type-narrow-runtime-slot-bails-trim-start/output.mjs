import _globalThis from "@core-js/pure/actual/global-this";
import _trimStartMaybeString from "@core-js/pure/actual/string/instance/trim-start";
var _ref;
// `typeof` always yields a string - the member narrows and the string method polyfills
// @ts-expect-error a computed enum member the runtime makes a string is the shape under test
enum E4 {
  T = typeof _globalThis
}
// @ts-expect-error a computed enum member the runtime makes a string is the shape under test
use(_trimStartMaybeString(_ref = E4.T).call(_ref));