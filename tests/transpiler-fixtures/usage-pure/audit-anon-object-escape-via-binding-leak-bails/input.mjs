// An anonymous object inside a CONTAINER is bound to a name through that container, so the object escapes
// iff the BINDING leaks. A binding read only as a member (`local[0].read()`) stays module-local and keeps
// the per-element narrow (`this.data.at` -> `_atMaybeArray`). A binding that is handed out - exported,
// returned, passed - leaks the element, so `this.data.includes` drops to the generic helper (`_includes`).
const local = [{ data: ["x"], read() { return this.data.at(0); } }];
function readElement() { return local[0].read(); }
const leaked = [{ data: ["y"], scan() { return this.data.includes("z"); } }];
export { readElement, leaked };
