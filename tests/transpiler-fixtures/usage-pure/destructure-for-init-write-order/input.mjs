// The initializer observes hoisted bindings before either extraction writes them.
// Earlier and later declarators retain their source positions in the loop header.
function rows() { record(typeof method); return [4, 9]; }
for (var before = mark('before'), { at: method, length: size } = rows(), after = mark(typeof method); before; before--) {
  use(method.call([4, 9], -1), size, after);
}
