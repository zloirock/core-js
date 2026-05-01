// User-declared `function _ref` shadows plugin's slot 1. Plugin allocator
// must consult scope binding (babel) / collectAllBindingNames (unplugin)
// and pick `_ref2` instead. Test verifies bare-slot shadow path
function _ref(x) {
  return x.find(item => item > 0);
}
const arr = [1, 2, 3];
arr.at(0);
arr.findLast(x => x > 0);
_ref(arr);
