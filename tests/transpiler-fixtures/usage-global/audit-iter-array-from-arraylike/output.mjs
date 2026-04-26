import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// `Array.from(arrayLike)`: the iteration protocol must be polyfilled along with the
// static method since `Array.from` falls through to it for non-iterable inputs.
Array.from({
  length: 3,
  0: 'a',
  1: 'b',
  2: 'c'
});