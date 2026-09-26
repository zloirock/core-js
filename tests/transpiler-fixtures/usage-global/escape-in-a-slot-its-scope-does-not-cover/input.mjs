// Parameter defaults and decorators see the outer scope, before body declarations apply.
// The local identity call retains Map without exposing it; the external decorator exposes Promise.
// An enclosing block still shadows a default's Symbol reference.
function hand(x) {
  return x;
}
function withDefault(x = hand(Map)) {
  var Map = 1;
  return [x, Map];
}
withDefault();
new Map();
class Decorated {
  m(@inject(hand(Promise)) p: any) {
    var Promise = 1;
    return [p, Promise];
  }
}
new Decorated().m(1);
new Promise(function (r) {
  r();
});
{
  let Symbol = 1;
  function covered(x = hand(Symbol)) {
    return x;
  }
  covered();
}
sink(Symbol('x'));
export const done = true;
