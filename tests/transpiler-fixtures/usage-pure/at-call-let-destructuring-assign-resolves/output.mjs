import _atMaybeString from "@core-js/pure/actual/string/instance/at";
let name;
({
  name
} = {
  name: "alice"
});
_atMaybeString(name).call(name, -1);