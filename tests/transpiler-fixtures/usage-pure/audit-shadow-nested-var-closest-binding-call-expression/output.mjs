import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
var iterator = _Symbol$iterator;
function viaSymbol() {
  {
    var iterator = {};
  }
  return [1][iterator];
}
export const s = viaSymbol();