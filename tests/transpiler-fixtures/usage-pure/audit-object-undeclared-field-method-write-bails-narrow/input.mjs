// `data` is never a declared own property: an external write seeds it as an array, but a
// method writes it to an incompatible type. The inside-method write must join the candidate
// union so the read bails to the general variant.
const obj = {
  poison() { this.data = "shadowed"; },
  read() { return this.data.at(-1); }
};
obj.data = [1, 2, 3];
obj.poison();
obj.read();
