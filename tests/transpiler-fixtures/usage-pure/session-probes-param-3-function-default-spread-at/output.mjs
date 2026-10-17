import _at from "@core-js/pure/actual/instance/at";
{
  function g(a = 's') {
    _at(a).call(a, 0);
  }
  g(...[[1]]);
}