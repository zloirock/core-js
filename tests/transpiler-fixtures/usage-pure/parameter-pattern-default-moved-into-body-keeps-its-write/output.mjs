import _Array$from from "@core-js/pure/actual/array/from";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
import _Math$sign from "@core-js/pure/actual/math/sign";
import _Math$trunc from "@core-js/pure/actual/math/trunc";
// A parameter default's write runs before the pattern reads a nested computed key.
// An earlier rewrite in the same file must preserve that write and its runtime receiver.
export function first() {
  let list;
  list = [3];
  const trunc = _Math$trunc;
  const make = (list = 'cd', _Math$sign);
  return [trunc, make, _includes(list).call(list, 'c')];
}
export function second() {
  let text = [1, 2];
  let head;
  (function ({
    from,
    prototype: {
      [head = _at(text).call(text, 0)]: missing
    }
  } = (text = 'ab', {
    from: _Array$from,
    prototype: Array.prototype
  })) {
    return [from, missing];
  })();
  return head;
}