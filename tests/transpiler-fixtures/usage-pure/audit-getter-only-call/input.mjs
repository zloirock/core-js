// Getter property whose return value is a known callable -
// resolveObjectMember should detect getter and route through resolveBodyReturnValue.
const obj = {
  get fn() {
    return [1, 2, 3];
  }
};
obj.fn.at(0);
