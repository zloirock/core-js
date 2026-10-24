import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.of";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
// A write in the sequence prefix of a destructure assignment's value runs before the pattern assigns,
// so a later read takes the written value's type - in a block, where only the statements ahead of the
// read are consulted, and in a later element of a sequence statement.
let text = [1, 2];
let list = 'cd';
let from, of;
if (ready) {
  ({
    from
  } = (text = 'ab', Array));
  use(text.at(-1));
}
if (ready) {
  ({
    of
  } = (list = [3, 4], Array));
  use(list.includes(3));
}
use(from, of);