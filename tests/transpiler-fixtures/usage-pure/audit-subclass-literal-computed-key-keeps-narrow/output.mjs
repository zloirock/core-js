import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `Sub` shadows only a STATIC literal computed key `["other"]`, a known non-match for `items`, so
// it cannot shadow the inherited field and the `this.items` array narrow holds - giving the
// array-specific `.at` polyfill. Confirms a literal computed key does not over-bail.
class Base {
  items = [1, 2, 3];
  getFirst() {
    var _ref;
    return _atMaybeArray(_ref = this.items).call(_ref, 0);
  }
}
class Sub extends Base {
  ["other"] = "x";
}
const b: Base = new Sub();
b.getFirst();