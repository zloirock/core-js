import _Promise from "@core-js/pure/actual/promise";
// Parameter defaults and decorators see the outer scope, before body declarations apply.
// The local identity call retains Map; its pure binding carries the namespace.
// The external decorator exposes Promise. An enclosing block still shadows the default's Symbol.
function hand(x) {
  return x;
}
class Decorated {
  m(@inject(hand(_Promise))
  p: any) {
    var Promise = 1;
    return [p, Promise];
  }
}
new Decorated().m(1);