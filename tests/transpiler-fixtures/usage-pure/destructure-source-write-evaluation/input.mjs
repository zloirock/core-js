// The initializer is captured before the key changes its source binding.
const events = [];
const first = [4, 5];
let current = first;
export const {
  [(events.push('key'), current = 'xy', 'at')]: method = () => -1,
  includes: contains,
} = (events.push([1].flat()[0]), current);
method.call(first, -1);
contains.call(first, 4);
