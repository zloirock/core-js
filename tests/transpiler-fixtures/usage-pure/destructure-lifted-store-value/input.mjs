// A destructure consumer owns the realm value held by its lifted store. A store in a
// discarded source prefix has no such consumer and retains the terminal environment probe.
let held, count = 0, Assigned;
const { Map: Declared } = (held = (count++, globalThis.self).window);
const declaredStore = held;
({ Map: Assigned } = (held = (count++, globalThis.self).window));
const assignedStore = held;
const { Map: PrefixOnly } = (held = (count++, globalThis.self).window, globalThis);
export { Declared, Assigned, PrefixOnly, declaredStore, assignedStore, held, count };
