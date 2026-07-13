// TS satisfies-cast wrapper on an increment/decrement operand: skipped, same as the
// TS as-cast variant. the update marks the slot mutated and DEOPTS the name - the bare
// `let x = Map` read stays verbatim on the live binding
let x = Map;
x++;
(Map satisfies Function)++;
