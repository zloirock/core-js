// Parameter defaults and decorators see the outer scope, before body declarations apply.
// The local identity call retains Map; its pure binding carries the namespace.
// The external decorator exposes Promise. An enclosing block still shadows the default's Symbol.
function hand(x) {
  return x;
}
{
  let Symbol = 1;
  function covered(x = hand(Symbol)) {
    return x;
  }
  covered();
}