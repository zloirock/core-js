import _Map from "@core-js/pure/actual/map/constructor";
// TS satisfies-cast wrapper on an increment/decrement operand: skipped, same as the
// TS as-cast variant. bare `let x = Map` outside any update context is still rewritten to `_Map`
let x = _Map;
x++;
Map satisfies Function++;