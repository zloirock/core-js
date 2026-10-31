import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// The initializer observes hoisted bindings before either extraction writes them.
// Earlier and later declarators retain their source positions in the loop header.
function rows() {
  record(typeof method);
  return [4, 9];
}
for (var before = mark('before'), _ref = rows(), method = _atMaybeArray(_ref), {
    length: size
  } = _ref, after = mark(typeof method); before; before--) {
  use(method.call([4, 9], -1), size, after);
}