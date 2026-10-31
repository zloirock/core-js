// A sealed receiver throws before the static key and argument are evaluated.
// An open chain skips both; a call outside its seal still evaluates its argument.
export function sealed(mark) {
  return (globalThis.window?.self).Array[(mark('key'), 'from')](mark('argument'));
}
export function open(mark) {
  return globalThis.window?.self.Array[(mark('key'), 'of')](mark('argument'));
}
export function call(mark) {
  return (globalThis.window?.self.Object.assign)(mark('argument'));
}
export function sealedKey(mark) {
  return (globalThis.window?.self).self[(mark('key'), 'guardBoundaryAbsent')];
}
export function optionalReader(mark) {
  return (globalThis.window?.self).self?.[(mark('key'), 'guardBoundaryAbsent')];
}
export function deepReader(mark) {
  return (globalThis.window?.self).self.self[(mark('key'), 'guardBoundaryAbsent')];
}
export function windowReader(mark) {
  return (globalThis.window?.self).self.window?.[(mark('key'), 'guardBoundaryAbsent')];
}
export function storedReader(mark, held) {
  return ((held = globalThis.window)?.self).self[(mark('key'), 'guardBoundaryAbsent')];
}
export function callRootReader(mark) {
  return ((() => globalThis)().window?.self).self[(mark('key'), 'guardBoundaryAbsent')];
}
