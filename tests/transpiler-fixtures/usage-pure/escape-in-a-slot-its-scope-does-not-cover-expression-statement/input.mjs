// Parameter defaults and decorators see the outer scope, before body declarations apply.
// The local identity call retains Map; its pure binding carries the namespace.
// The external decorator exposes Promise. An enclosing block still shadows the default's Symbol.
function hand(x) {
  return x;
}
function withDefault(x = hand(Map)) {
  var Map = 1;
  return [x, Map];
}
withDefault();
