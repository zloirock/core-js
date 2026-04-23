import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `(s.kind) === 'a'` - paren-wrapped discriminant ref. peelParensAndChain unwraps both
// parens and ChainExpression, then memberLiteralPair's isStaticDotAccess sees the inner
// MemberExpression. narrow fires identically to the unwrapped form
type Shape = {
  kind: 'a';
  data: number[];
} | {
  kind: 'b';
  data: string;
};
declare const s: Shape;
if (s.kind === 'a') {
  var _ref;
  _atMaybeArray(_ref = s.data).call(_ref, 0);
}