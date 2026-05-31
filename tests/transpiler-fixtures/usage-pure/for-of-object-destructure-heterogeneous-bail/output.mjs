import _at from "@core-js/pure/actual/instance/at";
for (const {
  x
} of [{
  x: [1]
}, {
  x: 'hello'
}]) {
  _at(x).call(x, -1);
}