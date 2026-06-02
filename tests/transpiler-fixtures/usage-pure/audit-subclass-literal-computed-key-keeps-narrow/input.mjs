// `Sub` shadows only a STATIC literal computed key `["other"]`, a known non-match for `items`, so
// it cannot shadow the inherited field and the `this.items` array narrow holds - giving the
// array-specific `.at` polyfill. Confirms a literal computed key does not over-bail.
class Base { items = [1, 2, 3]; getFirst() { return this.items.at(0); } }
class Sub extends Base { ["other"] = "x"; }
const b: Base = new Sub();
b.getFirst();
