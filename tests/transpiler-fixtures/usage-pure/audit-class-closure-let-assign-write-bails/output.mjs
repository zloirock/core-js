import _at from "@core-js/pure/actual/instance/at";
// `let c; c = new C(); c.items = ...; c.m()` - assignment-init binding IS tracked in the
// instance closure (AssignmentExpression LHS-Identifier shape recognised alongside
// declarator-init), so the field-write through `c.items` folds into the candidate set.
// result: narrow correctly bails because items now has String shape too
class C {
  items = [1, 2, 3];
  getFirst() {
    var _ref;
    return _at(_ref = this.items).call(_ref, 0);
  }
}
let c;
c = new C();
c.items = 'oops';
c.getFirst();