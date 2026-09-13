import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/web.dom-collections.iterator";
// Extracting a method from a wrapped object lets its caller supply another receiver.
// The declared rows are an array, but the borrowed call reads a string: both includes families
// remain possible inside the method, while the wrapper and extraction keep their source form.
const holder = {
  rows: ['a', 'b'],
  read() {
    return this.rows.includes('a,b');
  }
};
const [{
  read
}] = [holder];
export default read.call({
  rows: 'a,b'
});