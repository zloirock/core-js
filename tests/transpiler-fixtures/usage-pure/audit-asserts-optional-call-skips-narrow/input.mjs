// `assertStr?.(x)` may skip the call when the binding is null at runtime; TS does not
// narrow x in that case. the assertion-statement guard inspects the raw expression
// before the runtime-transparent peel strips ChainExpression and bails on any optional
// segment, so the post-statement `.at(0)` falls back to the generic `_at` polyfill rather
// than the unsound `_atMaybeString` narrow that would crash on a non-string runtime value
declare const assertStr: (x: unknown) => asserts x is string;
function probe(x: unknown) {
  (assertStr as any)?.(x);
  return x.at(0);
}
