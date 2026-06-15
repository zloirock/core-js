import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.includes";
// `super.includes(x)` inside an INSTANCE method of `extends Array` reads the parent PROTOTYPE,
// where instance methods are live, so usage-global must inject the instance-method polyfill. an
// over-broad static-context bail used to drop it (the same lookup in a STATIC method is dead and
// is still skipped). includes is shared by Array and String, so both surfaces are injected.
class C extends Array {
  has(x) {
    return super.includes(x);
  }
}
new C().has(1);