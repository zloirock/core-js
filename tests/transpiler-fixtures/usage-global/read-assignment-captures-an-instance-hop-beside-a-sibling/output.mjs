import "core-js/modules/es.array.at";
import "core-js/modules/es.array.find-last";
// An assignment whose value is read keeps its receiver, so an instance claim under a hop is captured
// even where the hop's level holds a sibling: the level splits around the captured hop in source order,
// and the assignment still yields the source's own value.
const box = {
  items: [1, 2],
  label: 'x'
};
const pair = {
  name: 'y',
  list: [3, 4]
};
let at, label, name, findLast, first, second;
first = {
  items: {
    at
  },
  label
} = box;
second = {
  name,
  list: {
    findLast
  }
} = pair;
export { at, label, name, findLast, first, second };