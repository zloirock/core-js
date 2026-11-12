import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// A partial consume cannot lift its prefix above earlier declarators.
const before = effect('before'),
  {
    [(effect('key'), 'Array')]: {
      from
    },
    other
  } = (effect('prefix'), {
    Array: {
      from: _Array$from
    },
    get other() {
      return _globalThis.other;
    }
  }),
  after = effect('after');
use(before, from, other, after);