// with `createParenthesizedExpressions: true` babel keeps `(Map)` as a ParenthesizedExpression
// wrapper. UpdateExpression operand peel previously only stripped TS wrappers, so `(Map)++`
// slipped past and polyfill injection emitted `_Map++` - runtime TypeError (imports are
// read-only). fix: also peel ParenthesizedExpression so UpdateExpression context is detected
function bump() {
  (Map)++;
}
