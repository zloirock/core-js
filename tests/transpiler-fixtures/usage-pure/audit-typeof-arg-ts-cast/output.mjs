import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// `typeof (x as any) === "string"` semantically narrows x. the typeof-var matcher peels
// the typeof operand through the runtime-transparent peel (parens / chain / TS wrappers
// `as` / `satisfies` / `!`), so TS-cast / non-null-assertion / parenthesized forms reach
// the bare-Identifier check uniformly with the type-guard left/right peel
function probe(x: unknown) {
  if (typeof (x as any) === "string") {
    return _atMaybeString(x).call(x, 0);
  }
  return null;
}