// TSSatisfiesExpression wrapper on UpdateExpression operand: skipped (parallel to TS
// as-cast). bare `let x = Map` outside any update context is still rewritten to `_Map`
let x = Map;
x++;
(Map satisfies Function)++;
