import _Array$from from "@core-js/pure/actual/array/from";
// Callback-local aliases share the lexical source seen by their assignments.
// Cross assignments keep the captured Array holder; nested destructuring
// must replace Array.from even though the callback body declares both aliases.
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
  } = {
    x: {
      from: _Array$from
    }
  };
  return from({
    0: 'callback',
    length: 1
  });
});