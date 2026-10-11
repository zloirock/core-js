import _Map from "@core-js/pure/actual/map/constructor";
// a binding reassigned to a selection of its own navs (`p = p && (p.a || p.b)`) adds no value of its
// own to the union over its writes: the union terminates and still names the constructor its init holds
let parent = _Map;
while (parent = parent && (parent.assignedSlot || parent.parentNode || parent.host)) {
  if (parent.done) break;
}
parent.groupBy([], x => x);