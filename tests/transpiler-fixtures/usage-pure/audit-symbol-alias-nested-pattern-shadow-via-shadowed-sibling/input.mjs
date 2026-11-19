const { iterator } = Symbol;
function shadowedSibling() {
  const userSymbol = { iterator: 1 };
  const { iterator } = userSymbol;
  return ['a', 'b'][iterator];
}
export const viaShadowedSibling = shadowedSibling();
