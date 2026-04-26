// class private field initialised with `new Map(...)`: the initializer expression is
// scanned and the constructor call is polyfilled in pure-mode.
class C { #map = new Map(); get(k) { return this.#map.get(k); } }
