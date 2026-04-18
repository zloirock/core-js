var _ref;
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `abstract class` carries a real `constructor` method in body - the walker ignores the
// abstract flag and still reads params like a regular class
abstract class Foo {
  constructor(x: string = 'a') {}
}
declare const args: ConstructorParameters<typeof Foo>;
null == (_ref = _atMaybeArray(args).call(args, 0)) ? void 0 : _atMaybeString(_ref).call(_ref, -1);