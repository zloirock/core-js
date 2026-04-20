// nested parens around the UpdateExpression operand - isUpdateWrapper walks through
// multiple ParenthesizedExpression layers before reaching UpdateExpression parent
let x = Map;
x++;
(((Map)))++;
--((Promise));
