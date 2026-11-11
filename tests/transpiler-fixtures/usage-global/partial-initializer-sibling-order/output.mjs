import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// A partial consume cannot lift its prefix above earlier declarators.
const before = effect('before'),
  {
    [(effect('key'), 'Array')]: {
      from
    },
    other
  } = (effect('prefix'), globalThis),
  after = effect('after');
use(before, from, other, after);