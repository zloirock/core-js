import _at from "@core-js/pure/actual/instance/at";
const rest = [];
{
  function f(a = [1]) {
    return a;
  }
  const v = f(...rest);
  _at(v).call(v, 0);
}