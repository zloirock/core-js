import _Symbol from "@core-js/pure/actual/symbol/constructor";
const symVarRoot = _Symbol;
export function viaSymbolVarShadow() {
  {
    const symVarRoot = {};
    var symHeld = symVarRoot;
  }
  {
    const {
      asyncIterator
    } = symHeld;
    return [1][asyncIterator];
  }
}