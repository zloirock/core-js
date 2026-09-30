// The length key reads an ordinary array property and does not select an element.
const nonIndexName = function () {
  const {
    length
  } = [[10]];
  return length;
}();
export { nonIndexName };