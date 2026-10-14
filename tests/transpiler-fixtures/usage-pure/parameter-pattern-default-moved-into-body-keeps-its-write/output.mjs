import _Array$from from "@core-js/pure/actual/array/from";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
import _Math$sign from "@core-js/pure/actual/math/sign";
import _Math$trunc from "@core-js/pure/actual/math/trunc";
// A parameter pattern's rewrite moves the default into the function body, the writes in it with it. A
// read in a nested key of the pattern still sees the default's write, also once a rewrite elsewhere in
// the file has every write record read again.
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
  (function (_ref = void 0) {
    let _ref2 = false;
    let _ref3 = _ref === void 0 ? (_ref2 = true, text = 'ab', Array) : _ref,
      {} = _ref3,
      {
        from
      } = _ref2 ? {
        from: _Array$from
      } : _ref3,
      {
        prototype: {
          [head = _at(text).call(text, 0)]: missing
        }
      } = _ref3;
    return [from, missing];
  })();
  return head;
}