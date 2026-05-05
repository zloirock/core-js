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
tag.at(0);
tag.includes('A');
