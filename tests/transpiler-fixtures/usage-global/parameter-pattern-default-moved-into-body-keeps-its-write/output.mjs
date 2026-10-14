import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.math.sign";
import "core-js/modules/es.math.trunc";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
// A parameter pattern's rewrite moves the default into the function body, the writes in it with it. A
// read in a nested key of the pattern still sees the default's write, also once a rewrite elsewhere in
// the file has every write record read again.
export function first() {
  let list;
  const {
    trunc,
    [(list = 'cd', 'sign')]: make
  } = (list = [3], Math);
  return [trunc, make, list.includes('c')];
}
export function second() {
  let text = [1, 2];
  let head;
  (function ({
    from,
    prototype: {
      [head = text.at(0)]: missing
    }
  } = (text = 'ab', Array)) {
    return [from, missing];
  })();
  return head;
}