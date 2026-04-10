import _atMaybeString from "@core-js/pure/actual/string/instance/at";
const key = 'name';
let name;
({
  [key]: name
} = {
  name: 'alice'
});
_atMaybeString(name).call(name, -1);