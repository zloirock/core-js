import _at from "@core-js/pure/actual/instance/at";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
const arr = [1, 2];
const nb = {
  y: arr
};
{
  const q = _Object$hasOwn;
  function g(_ref = [...[nb]]) {
    let [_ref2] = _ref;
    let a = _at(_ref2.y);
    return a;
  }
}