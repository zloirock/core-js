// Getter property whose return value is a known callable -
// object-member resolution should detect the getter and route through its body's return value.
const obj = {
  get fn() {
    return [1, 2, 3];
  }
};
obj.fn.at(0);
