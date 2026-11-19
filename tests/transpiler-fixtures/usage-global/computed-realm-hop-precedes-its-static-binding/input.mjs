// The key observes the binding before initialization; the next sibling observes its new value.
export function read(log) {
  function key() {
    log.push(typeof resolve);
    return 'Promise';
  }
  var { globalThis: { [key()]: { resolve } }, next } = globalThis;
  return [resolve, next];
}
