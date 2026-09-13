import _at from "@core-js/pure/actual/instance/at";
// A nested computed-key capture stays in the loop initializer and preserves its evaluation order.
export function head(make, outer, leaf) {
  for (let _ref2 = make(), {
      [(outer(), 'w')]: _ref
    } = null == _ref2 ? _ref2[""] : _ref2, _ref3 = _ref, method = null == _ref3 ? _ref3[""] : (leaf(), _at(_ref3));;) return method;
}