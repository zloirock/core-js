// an anonymous object handed to a for-of head reaches the loop variable, so a write through that
// variable retypes the field just as a write through the object's own name would. the narrow may
// only survive while the alias is tracked - the first row writes a string over an array field and
// must widen, the second has no write and keeps its narrow. `at` and `includes` are the two methods
// carrying both an array and a string variant, so the widened entry is visible as a different helper
for (const written of [{ items: [1], read() { return this.items.includes("bc"); } }]) {
  written.items = "abc";
  written.read();
}
for (const untouched of [{ items: [1], read() { return this.items.at(0); } }]) {
  untouched.read();
}
