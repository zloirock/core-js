import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// class-as-namespace via class EXPRESSION (not declaration): `const Box = class { static
// Promise = Promise }; class C extends Box.Promise`. resolveBindingToGlobalName must
// follow declarator init through ClassExpression and find the static property's value,
// symmetric to the ClassDeclaration case
const Box = class {
  static Promise = _Promise;
};
class C extends Box.Promise {
  static run() {
    return _Promise$try.call(this, () => 1);
  }
}