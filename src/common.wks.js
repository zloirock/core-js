var wellKnownSymbols = {};
function getWellKnownSymbol(name){
  return wellKnownSymbols[name] || (wellKnownSymbols[name] =
    (global.Symbol && global.Symbol[name]) || safeSymbol('Symbol.' + name));
}