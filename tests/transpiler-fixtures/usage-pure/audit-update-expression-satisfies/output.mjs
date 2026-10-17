import _Map from "@core-js/pure/actual/map";
// TS satisfies-cast wrapper on an increment/decrement operand: skipped, same as the
// TS as-cast variant. the update marks the slot mutated for what runs after it - the bare
// `let x = Map` read runs ahead of it and takes the pure import
let x = _Map;
x++;
Map satisfies Function++;