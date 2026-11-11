import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
var _ref3, _ref4;
// A nested iterator default runs after its earlier sibling and before the later one.
// The global mode keeps the native pattern and supplies the symbol key.
function read(source) {
  var _ref2;
  const {
      y: _ref
    } = {
      y: source
    },
    {
      before = note('before')
    } = _ref,
    iterator = (_ref2 = _getIteratorMethod(_ref)) === void 0 ? note('default') : _ref2,
    {
      after = note(iterator)
    } = _ref;
  return [before, iterator, after];
}
let first, method, last;
({
  y: _ref3
} = {
  y: source
});
({
  first = note('first')
} = _ref3), method = (_ref4 = _getIteratorMethod(_ref3)) === void 0 ? note('method') : _ref4, {
  last = note(method)
} = _ref3;
use(read, first, method, last);