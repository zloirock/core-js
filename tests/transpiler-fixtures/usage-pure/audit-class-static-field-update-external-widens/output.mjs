import _at from "@core-js/pure/actual/instance/at";
// external UpdateExpression on a static field (`C.counter++`) is arithmetic-coerced. target
// lives at `.argument` (not `.left`). write must register in the module index alongside
// AssignmentExpression so the consumer can widen the field-flow fold to generic dispatch
class C {
  static counter = [0];
  static head() {
    var _ref;
    return _at(_ref = C.counter).call(_ref, 0);
  }
}
C.counter++;
C.head();