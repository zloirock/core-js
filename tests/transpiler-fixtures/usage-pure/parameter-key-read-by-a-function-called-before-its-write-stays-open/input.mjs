// a parameter holds the caller's value until a write replaces it, and a function declaration reading it
// may run before that write wherever the source spells it: a key the parameter selects after an early
// call stays the caller's, whether one write or a complete branching construct replaces it. a read
// after the write takes the iterator method
export function settled(target, key) {
  const early = read();
  if (typeof Symbol != 'undefined') key = Symbol.iterator;
  else key = '@@iterator';
  function read() {
    return target[key];
  }
  return early;
}
export function written(target, key) {
  const early = read();
  key = Symbol.iterator;
  function read() {
    return target[key];
  }
  return early;
}
export function late(target, key) {
  if (typeof Symbol != 'undefined') key = Symbol.iterator;
  else key = '@@iterator';
  return target[key];
}
