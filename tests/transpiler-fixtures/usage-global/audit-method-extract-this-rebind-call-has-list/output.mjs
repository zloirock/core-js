import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.includes";
const called = {
  list: [2],
  has() {
    return this.list.includes(2);
  }
};
called.has.call({
  list: 'pq'
});