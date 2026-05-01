// `Date`/`Function`/`TypedArray` have no `pure` global ctor in built-in
// definitions, only static methods. `entryToGlobalHint` must NOT generate
// hints for them via `deriveHintFromKebab` - downstream `hasOwn(desc, 'pure')`
// gate is the safety net but the hint itself should resolve to a name
// whose statics carry no pure variant
import Date from "@core-js/pure/actual/date";
class MyDate extends Date {
  describe() {
    return super.toJSON();
  }
}
new MyDate().describe();