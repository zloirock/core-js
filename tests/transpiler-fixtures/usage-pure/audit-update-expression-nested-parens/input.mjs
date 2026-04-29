// nested parens around an increment/decrement operand - the update-wrapper detection
// walks through multiple paren layers before reaching the increment/decrement parent
let x = Map;
x++;
(((Map)))++;
--((Promise));
