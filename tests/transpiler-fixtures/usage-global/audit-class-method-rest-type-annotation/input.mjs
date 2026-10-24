// class method with rest-param type annotation - the type references `Map`, `Promise`,
// `Array` are scanned for polyfill hints in usage-global mode and trigger imports for
// those constructors and their iterator integration.
class Batcher {
  enqueue(first: Map<string, number>, ...rest: Array<Promise<unknown>>): void {}
}
