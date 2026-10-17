class Keeper {
  entries = ["a", "b"];
  hasFirst() {
    return this.entries.includes("a");
  }
}
new Keeper().hasFirst();
