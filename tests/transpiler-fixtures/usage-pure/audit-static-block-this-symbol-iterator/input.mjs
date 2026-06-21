// `this[Symbol.iterator]` in a static block. `this` is the constructor; the Array
// constructor has no own Symbol.iterator (only Array.prototype does), so raw access is
// undefined. the access is routed through the iteration-protocol helper: equivalent here,
// but it normalises legacy edge cases (e.g. Arguments objects missing prototype iterator).
class C extends Array {
  static {
    const it = this[Symbol.iterator];
  }
}
