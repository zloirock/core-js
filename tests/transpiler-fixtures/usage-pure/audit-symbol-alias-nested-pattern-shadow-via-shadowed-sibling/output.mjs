import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
const iterator = _Symbol$iterator;
function shadowedSibling() {
  const userSymbol = {
    iterator: 1
  };
  const {
    iterator
  } = userSymbol;
  return ['a', 'b'][iterator];
}
export const viaShadowedSibling = shadowedSibling();