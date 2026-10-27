import _at from "@core-js/pure/actual/instance/at";
// The null test observes the stored value after both sequence prefixes.
// The index runs only in the live branch and after the store it reads.
let held;
function read(value) {
  var _ref;
  return null == (_ref = (outer(), inner(), held = value)) ? void 0 : (_at(_ref) || 0).call(_ref, index(held));
}
read(source);