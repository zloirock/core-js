import _at from "@core-js/pure/actual/instance/at";
const rest = [];
{
  function f({
    x
  }) {
    return x;
  }
  const v = f(...rest);
  _at(v).call(v, 0);
}