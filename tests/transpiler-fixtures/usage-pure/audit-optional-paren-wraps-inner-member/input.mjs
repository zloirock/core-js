// outer paren wraps the member access whose object is itself parenthesised:
// `(((arr).at))?.(0)`. peel must traverse outer paren -> inner-paren -> MemberExpression,
// where `MemberExpression.object` is `ParenthesizedExpression(arr)`. observable line
// shows both inner and outer paren layers participate in operand resolution
const a = (((arr).at))?.(0);
const b = (((arr).flat))?.();
