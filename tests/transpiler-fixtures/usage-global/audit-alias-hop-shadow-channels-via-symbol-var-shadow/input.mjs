const symVarRoot = Symbol;
export function viaSymbolVarShadow() {
  { const symVarRoot = {}; var symHeld = symVarRoot; }
  { const { asyncIterator } = symHeld; return [1][asyncIterator]; }
}
