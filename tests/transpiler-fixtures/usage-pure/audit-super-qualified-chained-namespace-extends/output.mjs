import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// chained inheritance through qualified parents: `Child extends NS.Mid extends NS.Base`.
// the member lookup must resolve the qualified super shape at EACH hop for the return-type
// hint to propagate down to the leaf subclass; if the first qualified hop fails, the
// inheritance chain breaks at Mid and `.at(0)` loses the array narrow.
namespace NS {
  export class Base {
    static gather(x: string): string[] {
      return [x];
    }
  }
  export class Mid extends Base {}
}
class Child extends NS.Mid {}
const arr = Child.gather('x');
_atMaybeArray(arr).call(arr, 0);