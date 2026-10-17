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
// A parameter default's write runs before the pattern reads a nested computed key.
// An earlier rewrite in the same file must preserve that write and its runtime receiver.
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