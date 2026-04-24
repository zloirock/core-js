import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// `this[Symbol.iterator]` in a static block. `this` is the constructor at runtime,
// and the Array constructor has no own Symbol.iterator (only Array.prototype does),
// so the raw access returns undefined. plugin routes Symbol.iterator property access
// through the iteration-protocol helper: semantically equivalent (helper also returns
// undefined for non-iterable receivers), but the helper normalises edge cases like
// Arguments objects in legacy engines where Symbol.iterator on the prototype is missing
class C extends Array {
  static {
    const it = _getIteratorMethod(this);
  }
}