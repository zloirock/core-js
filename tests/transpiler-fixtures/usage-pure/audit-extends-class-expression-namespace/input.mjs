// class-as-namespace via class EXPRESSION (not declaration): `const Box = class { static
// Promise = Promise }; class C extends Box.Promise`. resolveBindingToGlobalName must
// follow declarator init through ClassExpression and find the static property's value,
// symmetric to the ClassDeclaration case
const Box = class {
  static Promise = Promise;
};
class C extends Box.Promise {
  static run() { return super.try(() => 1); }
}
