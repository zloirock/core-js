// external UpdateExpression on a static field (`C.counter++`) is arithmetic-coerced. target
// lives at `.argument` (not `.left`). write must register in the module index alongside
// AssignmentExpression so the consumer can widen the field-flow fold to generic dispatch
class C {
  static counter = [0];
  static head() { return C.counter.at(0); }
}
C.counter++;
C.head();
