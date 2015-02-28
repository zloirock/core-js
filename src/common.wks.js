var wellKnownSymbols = {};
function getWellKnownSymbol(name, setter, forced){
  if(forced || !has(wellKnownSymbols, name)){
    wellKnownSymbols[name] = (Symbol && Symbol[name]) || (setter ? Symbol : safeSymbol)('Symbol.' + name);
  } return wellKnownSymbols[name];
}