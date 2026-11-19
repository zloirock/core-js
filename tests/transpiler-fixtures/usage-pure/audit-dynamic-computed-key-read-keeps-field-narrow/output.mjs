import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// a dynamic computed-key member as a READ is not a write channel: a DISCARDED read (`c[k];`)
// neither mutates nor holds anything, so the field narrow `this.box -> Array` is kept - the
// write-detection stays target-position-specific, not "any dynamic member". a HELD dynamic read
// (`const [x] = [d[k2]]`) could extract an own-this method whose `this` rebinds at a later
// invocation, so that shape bails to the generic helper
class C {
  box = [1, 2, 3];
  first() {
    var _ref;
    return _atMaybeArray(_ref = this.box).call(_ref, 0);
  }
}
declare const k: string;
const c = new C();
c[k];
c.first();
class D {
  list = [1, 2];
  probe() {
    var _ref2;
    return _includes(_ref2 = this.list).call(_ref2, 1);
  }
}
declare const k2: string;
const d = new D();
const [x] = [d[k2]];
d.probe();
void x;