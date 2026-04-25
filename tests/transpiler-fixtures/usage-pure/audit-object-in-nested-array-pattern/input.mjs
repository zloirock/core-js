// destructure-default through doubly-nested array-pattern - param position is still
// recognised once the wrapper layers are peeled
function f([[{ from } = Array]]) {
  return from([1]);
}
f([[Array]]);