import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _entries from "@core-js/pure/actual/instance/entries";
import _keys from "@core-js/pure/actual/instance/keys";
// a `new` reads the same argument slots a call does, and a CONSTRUCTOR spells its callers through
// the class - the one name they can write. but a construction hands the function's own identity to
// the object it builds: `inst.constructor` IS it, reachable off every instance and spelling no name
// a census keyed on names can count. so the proof holds only while the object is DROPPED where it
// stands; a HELD instance carries the channel on and keeps the generic dispatch. one method per
// row, or in usage-global the dropped rows would answer inside the held rows' own generic family
let droppedFunction;
let droppedClass;
function Dropped(a = [1, 2]) {
  droppedFunction = _atMaybeArray(a).call(a, 0);
}
new Dropped();
class DroppedClass {
  constructor(b = [1, 2]) {
    droppedClass = _includesMaybeArray(b).call(b, 1);
  }
}
new DroppedClass();
function Held(c = [1, 2]) {
  this.r = _keys(c).call(c);
}
const heldInstance = new Held();
class HeldClass {
  constructor(d = [1, 2]) {
    this.r = _entries(d).call(d);
  }
}
const heldClassInstance = new HeldClass();
export default [droppedFunction, droppedClass, heldInstance.r, heldClassInstance.r];