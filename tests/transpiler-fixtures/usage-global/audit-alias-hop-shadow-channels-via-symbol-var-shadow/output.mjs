import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.to-string";
const symVarRoot = Symbol;
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