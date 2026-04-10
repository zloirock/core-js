import _atMaybeString from "@core-js/pure/actual/string/instance/at";
for (const {
  name
} of [{
  name: 'hello'
}]) {
  _atMaybeString(name).call(name, -1);
}