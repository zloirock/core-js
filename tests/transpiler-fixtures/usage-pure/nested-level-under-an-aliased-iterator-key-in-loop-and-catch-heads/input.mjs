// A for-of head and a catch parameter take a nested level under an aliased iterator key the way they take
// its dotted spelling: the pattern moves into the body, where the level destructures the helper result of
// the iterator method off the element or the thrown value - a single instance leaf binding its own dispatch.
const it = Symbol.iterator;
for (const { [it]: { next } } of lists) use(next);
for (const { [it]: { name } } of maps) use(name);
try {
  run();
} catch ({ [it]: { length } }) {
  use(length);
}
