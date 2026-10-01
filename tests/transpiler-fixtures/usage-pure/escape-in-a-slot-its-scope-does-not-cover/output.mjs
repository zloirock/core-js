import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
// Parameter defaults and decorators see the outer scope, before body declarations apply.
// The local identity call retains Map; its pure binding carries the namespace.
// The external decorator exposes Promise. An enclosing block still shadows the default's Symbol.
function hand(x) {
  return x;
}
function withDefault(x = hand(_Map)) {
  var Map = 1;
  return [x, Map];
}
withDefault();
new _Map();
class Decorated {
  m(@inject(hand(_Promise))
  p: any) {
    var Promise = 1;
    return [p, Promise];
  }
}
new Decorated().m(1);
new _Promise(function (r) {
  r();
});
{
  let Symbol = 1;
  function covered(x = hand(Symbol)) {
    return x;
  }
  covered();
}
sink(_Symbol('x'));
export const done = true;