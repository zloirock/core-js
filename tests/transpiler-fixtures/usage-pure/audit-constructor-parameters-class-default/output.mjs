import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// `ClassDeclaration.params` is undefined - params live on the `constructor` method inside
// `body.body`; the Parameters/ConstructorParameters handler must descend there for class
class Foo {
  constructor(x: string = 'a') {}
}
declare const args: ConstructorParameters<typeof Foo>;
null == (_ref = _atMaybeArray(args).call(args, 0)) ? void 0 : _atMaybeString(_ref).call(_ref, -1);