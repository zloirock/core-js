import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
// outer paren wraps the member access whose object is itself parenthesised:
// `(((arr).at))?.(0)`. peel must traverse outer paren -> inner-paren -> MemberExpression,
// where `MemberExpression.object` is `ParenthesizedExpression(arr)`. observable line
// shows both inner and outer paren layers participate in operand resolution
const a = _at(arr)?.call(arr, 0);
const b = _flatMaybeArray(arr)?.call(arr);