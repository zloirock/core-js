// `Date`/`Function`/`TypedArray` have only static methods in built-in
// definitions, no `pure` global ctor. extending such a global must NOT
// derive a global-ctor hint - any hint should resolve to a name whose
// statics carry no pure variant, so no ctor import is emitted
import Date from "@core-js/pure/actual/date";
class MyDate extends Date {
  describe() {
    return super.toJSON();
  }
}
new MyDate().describe();
