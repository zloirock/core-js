import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
class C {
  items = [1, 2, 3];
  getFirst() {
    var _ref;
    return _atMaybeArray(_ref = this.items).call(_ref, 0);
  }
}

// declarator-bound instance - tracked in closure  
const a = new C();

// assignment-bound instance - currently isLeakPosition=true,
// bails ENTIRE closure (including a's narrow)
let b;
b = new C();

// no writes to b.items - if closure tracked correctly, a.getFirst() should narrow
a.getFirst();