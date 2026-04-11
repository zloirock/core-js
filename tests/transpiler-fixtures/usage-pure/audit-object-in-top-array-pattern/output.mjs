import _atMaybeString from "@core-js/pure/actual/string/instance/at";
const [{
  a
}] = [{
  a: "hello"
}];
_atMaybeString(a).call(a, -1);