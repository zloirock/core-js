// the stranger's instance is TRANSIENT, so the write lands straight on the construction
class Keeper {
  entries = ["a", "b"];
  hasFirst() {
    return this.entries.includes("a");
  }
}
function strangerTransientWrite() {
  class Keeper {}
  new Keeper().entries = "string";
}
strangerTransientWrite();
