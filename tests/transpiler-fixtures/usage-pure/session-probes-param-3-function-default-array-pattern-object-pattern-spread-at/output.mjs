import _at from "@core-js/pure/actual/instance/at";
const arr = [1, 2];
const nb = {
  y: arr
};
{
  function g(_ref = [...[nb]]) {
    let [_ref2] = _ref;
    let a = _at(_ref2.y);
    return a;
  }
}