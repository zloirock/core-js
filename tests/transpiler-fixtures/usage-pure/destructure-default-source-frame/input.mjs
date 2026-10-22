// The default captures an array before the parameter key writes a string.
// Its delayed method read must dispatch on that captured value.
const events = [];
const first = [4, 5];
let current = first;
export function read({
  value: {
    [(events.push('key'), current = 'xy', 'at')]: method = () => -1,
  },
} = { value: (events.push([1].at(0)), current) }) {
  return method;
}
read().call(first, -1);
