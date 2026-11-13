// A later parameter binding is still uninitialized when this key is evaluated.
export function read({
  [key]: at
}, key = 'at') {
  return at;
}