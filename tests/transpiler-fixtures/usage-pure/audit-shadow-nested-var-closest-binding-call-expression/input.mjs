var iterator = Symbol.iterator;
function viaSymbol() {
  { var iterator = {}; }
  return [1][iterator];
}
export const s = viaSymbol();
