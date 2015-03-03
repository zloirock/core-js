var wellKnownSymbols = {};
function wks(name){
  return wellKnownSymbols[name] || (wellKnownSymbols[name] =
    ($.g.Symbol && $.g.Symbol[name]) || uid.safe('Symbol.' + name));
}