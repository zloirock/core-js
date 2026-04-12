import _Map from "@core-js/pure/actual/map/constructor";
class C {
  #map = new _Map();
  get(k) {
    return this.#map.get(k);
  }
}