class Keeper {
  entries = ["a", "b"];
  hasFirst() {
    return this.entries.includes("a");
  }
}
const k = new Keeper();
k.entries = "string";
