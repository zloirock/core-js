// A closed parameter default retains native reads beside instance claims in source order.
const events = [];
const row = [0, 1, 2];
Object.defineProperty(row, '[@@iterator]', { get() { events.push('tag'); return 7; } });
function read({ [Symbol.iterator]: iterator, [(events.push('key'), '[@@iterator]')]: tag, at } = row) {
  return [tag, at.call(row, -1), iterator.call(row).next().value];
}
use(read());
