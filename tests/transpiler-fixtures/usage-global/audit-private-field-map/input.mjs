// class private field initialised with `new Map(...)`: the initializer expression is
// still scanned and the constructor call is polyfilled.
class C { #map = new Map(); get(k) { return this.#map.get(k); } }
