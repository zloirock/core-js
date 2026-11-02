// Excluding the realm entry leaves this declined pattern native.
let key = 'Promise';
export function read({ globalThis: { [key]: { prototype } } } = (key = 'Array', globalThis)) {
  return prototype;
}
