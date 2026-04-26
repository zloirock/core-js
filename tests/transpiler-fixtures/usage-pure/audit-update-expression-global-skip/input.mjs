// UpdateExpression operand is preserved verbatim - polyfilled identifier in `++`/`--`
// position must not be rewritten (would emit `_Map++` invalidly). same for the operand
// behind TS wrappers. unrelated `let x = Map` initializer outside any update context is
// still rewritten in the usual way
let x = Map;
x++;
(Map as unknown)!++;
--Promise;
Set!--;
