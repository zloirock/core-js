import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// resolveEnumMemberKind classifies UnaryExpression with operator +/-/~ as 'number' regardless
// of operand shape. `+'42'` evaluates to a number at runtime, so the kind is correctly 'number'.
// TS would actually reject this as a non-constant expression for numeric enums but we stay
// permissive on operand-shape inference. distinct methods per line probe the narrowed type.
enum N {
  A = +'42',
  B = -3,
  C = ~0,
}
declare const v: N;
const tag = String(v);
_atMaybeString(tag).call(tag, 0);
_includesMaybeString(tag).call(tag, 'A');