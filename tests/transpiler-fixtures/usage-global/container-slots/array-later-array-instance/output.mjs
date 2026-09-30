import "core-js/modules/es.array.at";
// A later numeric key preserves the array type of its own element.
const {
  1: {
    at
  }
} = ['abc', [1, 2]];
export { at };