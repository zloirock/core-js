import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.number.constructor";
import "core-js/modules/es.string.iterator";
// Callback-local aliases share the lexical source seen by their assignments.
// Cross assignments keep the captured Array holder; nested destructuring
// must inject Array.from even though the callback body declares both aliases.
function invoke(callback) {
  return callback();
}
export const result = invoke(() => {
  let first = {
    x: Number
  };
  let second = {
    x: Array
  };
  first = second;
  second = first;
  const {
    x: {
      from
    }
  } = first;
  return from({
    0: 'callback',
    length: 1
  });
});