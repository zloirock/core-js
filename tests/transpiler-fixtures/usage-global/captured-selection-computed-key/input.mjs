// Receiver effects precede the computed key and write; custom values remain native.
export function read(shim, effect, target) {
  return { [(effect(), 'from')]: target.value } = (effect(), shim || Array);
}
