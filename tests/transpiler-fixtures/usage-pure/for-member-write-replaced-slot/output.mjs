import _at from "@core-js/pure/actual/instance/at";
// Replacing an intermediate slot breaks the identity with the loop's written receiver.
const box = {
  values: []
};
for (box.values.at of [0]) {
  var _ref;
  box.values = 'abc';
  consume(_at(_ref = box.values).call(_ref, -1));
}