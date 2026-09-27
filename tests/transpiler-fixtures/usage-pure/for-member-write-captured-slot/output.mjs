import _at from "@core-js/pure/actual/instance/at";
// A slot written through a captured alias can select a different receiver in the body.
const inner = {
  value: []
};
const box = {
  inner
};
for (box.inner.value.at of [0]) {
  var _ref;
  inner.value = 'abc';
  consume(_at(_ref = box.inner.value).call(_ref, -1));
}