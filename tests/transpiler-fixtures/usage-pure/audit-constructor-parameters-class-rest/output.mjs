var _ref;
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// rest-param on class `constructor` - same shape as function rest, requires descent into
// `body.body` + `effectiveParam` unwrap to propagate element type T
class Foo {
  constructor(...xs: string[]) {}
}
declare const args: ConstructorParameters<typeof Foo>;
null == (_ref = _atMaybeArray(args).call(args, 0)) ? void 0 : _atMaybeString(_ref).call(_ref, -1);