import _Map from "@core-js/pure/actual/map";
import _self from "@core-js/pure/actual/self";
// A destructure consumer owns the realm value held by its lifted store. A store in a
// discarded source prefix has no such consumer and retains the terminal environment probe.
let held,
  count = 0,
  Assigned;
held = (count++, _self);
const Declared = _Map;
const declaredStore = held;
held = (count++, _self);
Assigned = _Map;
const assignedStore = held;
held = (count++, _self).window;
const PrefixOnly = _Map;
export { Declared, Assigned, PrefixOnly, declaredStore, assignedStore, held, count };