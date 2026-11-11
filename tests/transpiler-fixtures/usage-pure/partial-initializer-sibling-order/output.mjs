import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// A partial consume cannot lift its prefix above earlier declarators.
const before = effect('before');
effect('prefix');
const from = _Array$from;
const {
  [(effect('key'), 'Array')]: _unused,
  other
} = _globalThis;
const after = effect('after');
use(before, from, other, after);