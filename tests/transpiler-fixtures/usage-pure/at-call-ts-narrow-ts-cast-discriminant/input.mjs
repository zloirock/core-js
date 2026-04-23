// `(s.kind) === 'a'` - paren-wrapped discriminant ref. peelParensAndChain unwraps both
// parens and ChainExpression, then memberLiteralPair's isStaticDotAccess sees the inner
// MemberExpression. narrow fires identically to the unwrapped form
type Shape = { kind: 'a'; data: number[] } | { kind: 'b'; data: string };
declare const s: Shape;
if ((s.kind) === 'a') {
  s.data.at(0);
}
