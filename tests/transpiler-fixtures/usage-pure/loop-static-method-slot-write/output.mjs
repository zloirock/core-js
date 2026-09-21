import _at from "@core-js/pure/actual/instance/at";
// Replacing the constructor slot invalidates its static method's original return type.
const source = [Array];
source[0] = {
  from: () => 'abc'
};
for (const _ref of [source]) {
  var _ref2;
  let [{
    from,
    ...rest
  }] = _ref;
  consume(_at(_ref2 = from()).call(_ref2, -1), rest);
}