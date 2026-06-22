// An anonymous object literal whose method reads `this.<field>` is sound to narrow ONLY while the object
// stays module-local. Two positions hand a reference to external code, so the field could be reassigned
// from outside and the narrow must drop to generic: a call/new ARGUMENT (`reg({...})` - the callee may
// store + mutate it -> `_at`) and the module default export (`export default {...}` - importers get it
// -> `_includes`). An object consumed in place as a member-call receiver (`({...}).scan()`) cannot be
// reached externally, so its narrow stands (`_includesMaybeArray`)
declare function reg(o: any): void;
reg({ data: ["x"], read() { return this.data.at(0); } });
({ data: ["y"], scan() { return this.data.includes("z"); } }).scan();
export default { items: [1, 2], pick() { return this.items.includes(3); } };
