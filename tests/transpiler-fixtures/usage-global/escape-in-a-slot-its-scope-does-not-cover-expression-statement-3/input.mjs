// Parameter defaults and decorators see the outer scope, before body declarations apply.
// The local identity call retains Map without exposing it; the external decorator exposes Promise.
// An enclosing block still shadows a default's Symbol reference.
function hand(x) {
  return x;
}
class Decorated {
  m(@inject(hand(Promise)) p: any) {
    var Promise = 1;
    return [p, Promise];
  }
}
new Decorated().m(1);
