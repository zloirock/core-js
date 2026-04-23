// prefix `--(Map)` through ParenthesizedExpression wrapper (createParenthesizedExpressions: true).
// same peel as the postfix case - the UpdateExpression parent check walks past both TS wrappers
// and ParenthesizedExpression to detect read+write context
function wind() {
  --(Map);
}
