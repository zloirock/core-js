// TS satisfies-cast wrapper on an increment/decrement operand: skipped, same as the
// TS as-cast variant. bare `let x = Map` outside any update context is still rewritten to `_Map`
let x = Map;
x++;
(Map satisfies Function)++;
