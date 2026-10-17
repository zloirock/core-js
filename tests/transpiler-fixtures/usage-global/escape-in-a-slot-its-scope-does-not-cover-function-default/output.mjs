// Parameter defaults and decorators see the outer scope, before body declarations apply.
// The local identity call retains Map without exposing it; the external decorator exposes Promise.
// An enclosing block still shadows a default's Symbol reference.
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