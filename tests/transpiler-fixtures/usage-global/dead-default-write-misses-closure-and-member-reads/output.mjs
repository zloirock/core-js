import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.iterator";
// A default on a leaf whose static the build serves never runs: the injected static is never undefined.
// A write in it reaches no read - not one in a function declared above it, not one off the member it
// writes - so neither read loads the string modules the dead write would bring.
let list = [1, 2];
const box = {
  items: [3, 4]
};
export function last() {
  return list.at(-1);
}
const {
  from = (list = 'ab', box.items = 'cd', 0)
} = Array;
export const found = box.items.includes(3);
export const made = from([5]);