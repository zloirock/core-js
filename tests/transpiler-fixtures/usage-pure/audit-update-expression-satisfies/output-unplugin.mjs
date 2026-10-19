// TS satisfies-cast wrapper on an increment/decrement operand: skipped, same as the
// TS as-cast variant. the update marks the slot mutated for what runs after it - the bare
// `let x = Map` read runs ahead of it and takes the pure import
import _Map from "@core-js/pure/actual/map";

let x = _Map;

// @ts-expect-error an update through a cast, which tsc refuses, is the shape under test
x++;

// @ts-expect-error an update through a cast, which tsc refuses, is the shape under test
(Map satisfies Function)++;