import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// `ConstructorParameters<typeof Foo>` on a class with a default-valued constructor param.
// unlike functions, class constructor params live on the `constructor` method inside the
// class body, not on the class node itself. plugin descends into the body to find them,
// and peels the AssignmentPattern (default-value) wrapper to recover the declared type
class Foo {
  constructor(x: string = 'a') {}
}
declare const args: ConstructorParameters<typeof Foo>;
null == (_ref = _atMaybeArray(args).call(args, 0)) ? void 0 : _atMaybeString(_ref).call(_ref, -1);