// A definite slot assignment replaces the initial constructor with a custom receiver.
const box = {
  value: Array
};
box.value = {
  from: () => 'custom'
};
function read(held) {
  return held.from([1]);
}
read(box.value);