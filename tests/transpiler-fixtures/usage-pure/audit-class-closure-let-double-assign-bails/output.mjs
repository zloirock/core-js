import _at from "@core-js/pure/actual/instance/at";
// `let c; c = new C(); c = otherValue; c.m()` - the binding has multiple constantViolations
// (two distinct assignments). assignmentInitName conservative gate requires SOLE-assignment
// source via underlying constantViolations check in resolveInstanceBindingName, so this case
// bails: c could be `otherValue` at the use site
class C {
  items = [1, 2, 3];
  getFirst() {
    var _ref;
    return _at(_ref = this.items).call(_ref, 0);
  }
}
let c;
c = new C();
c = {
  getFirst: () => 'x'
};
c.getFirst();