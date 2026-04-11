import _Set from "@core-js/pure/actual/set/constructor";
const C = class extends _Set {
  first() {
    return this.values().next().value;
  }
};