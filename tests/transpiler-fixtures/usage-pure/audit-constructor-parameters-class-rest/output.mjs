import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// `ConstructorParameters<typeof Foo>` on a class with a rest param. rest params in class
// constructors have the same element-type inference as in functions - the collected tuple
// is `string[]`, so `.at(0)?.at(-1)` narrows to String instance polyfill at the inner hop
class Foo {
  constructor(...xs: string[]) {}
}
declare const args: ConstructorParameters<typeof Foo>;
null == (_ref = _atMaybeArray(args).call(args, 0)) ? void 0 : _atMaybeString(_ref).call(_ref, -1);