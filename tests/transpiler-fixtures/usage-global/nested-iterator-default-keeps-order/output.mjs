import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A nested iterator default runs after its earlier sibling and before the later one.
// The global mode keeps the native pattern and supplies the symbol key.
function read(source) {
  const {
    y: {
      before = note('before'),
      [Symbol.iterator]: iterator = note('default'),
      after = note(iterator)
    }
  } = {
    y: source
  };
  return [before, iterator, after];
}
let first, method, last;
({
  y: {
    first = note('first'),
    [Symbol.iterator]: method = note('method'),
    last = note(method)
  }
} = {
  y: source
});
use(read, first, method, last);