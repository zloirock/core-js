import "core-js/modules/es.array.includes";
class Keeper {
  entries = ["a", "b"];
  hasFirst() {
    return this.entries.includes("a");
  }
}
const k = new Keeper();
k.hasFirst();
k.entries = "string";